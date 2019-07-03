package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.japp.core.J;
import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.common.base.Strings;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.PackageBoxService;
import com.hengyi.japp.mes.auto.application.query.PackageBoxQuery;
import com.hengyi.japp.mes.auto.application.query.PackageBoxQueryForMeasure;
import com.hengyi.japp.mes.auto.domain.*;
import com.hengyi.japp.mes.auto.repository.PackageBoxRepository;
import com.hengyi.japp.mes.auto.search.lucene.PackageBoxLucene;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.SortField;
import org.apache.lucene.search.SortedNumericSortField;
import org.bson.conversions.Bson;
import org.eclipse.microprofile.reactive.streams.operators.ReactiveStreams;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.concurrent.CompletionStage;

import static com.mongodb.client.model.Filters.eq;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class PackageBoxRepositoryMongo extends MongoEntityRepository<PackageBox> implements PackageBoxRepository {
    private final JedisPool jedisPool;
    private final PackageBoxLucene packageBoxLucene;

    @Inject
    private PackageBoxRepositoryMongo(JedisPool jedisPool, PackageBoxLucene packageBoxLucene) {
        this.jedisPool = jedisPool;
        this.packageBoxLucene = packageBoxLucene;
    }

    @Override
    public PackageBox save(PackageBox packageBox) {
        if (packageBox.getPrintClass() == null) {
            packageBox.setPrintClass(packageBox.getBudatClass());
        }
        if (J.isBlank(packageBox.getCode()) && packageBox.getPrintDate() != null) {
            packageBox.setCode(generateCode(packageBox));
        }
        final PackageBox result = super.save(packageBox);
        packageBoxLucene.index(result);
        return result;
    }

    private String generateCode(PackageBox packageBox) {
        final LocalDate ld = J.localDate(packageBox.getPrintDate());
        final long between = ChronoUnit.DAYS.between(LocalDate.now(), ld);
        if (Math.abs(between) >= 365) {
            throw new RuntimeException("时间超出");
        }
        final String incrKey = PackageBoxService.key(ld);
        try (Jedis jedis = jedisPool.getResource()) {
            final Long l = jedis.incr(incrKey);
            final String serialCode = Strings.padStart("" + l, 5, '0');
            final Batch batch = packageBox.getBatch();
            final Workshop workshop = batch.getWorkshop();
            final Corporation corporation = workshop.getCorporation();
            final Product product = batch.getProduct();
            final String corporationPackageCode = corporation.getPackageCode();
            final String productCode = product.getCode();
            final Grade grade = packageBox.getGrade();
            final String gradeCode = grade.getCode();
            final DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyyMMdd");
            final String result = corporationPackageCode + productCode + ld.format(dtf) + batch.getBatchNo() + gradeCode + serialCode;
            // key 存在，但没有设置剩余生存时间
            if (jedis.ttl(incrKey) == -1) {
                // 一年后过期
                final long seconds = ChronoUnit.YEARS.getDuration().getSeconds();
                jedis.expire(incrKey, (int) seconds);
            }
            return result;
        }
    }

    @SneakyThrows
    @Override
    public Optional<PackageBox> findByCode(String code) {
        final Bson condition = unDeletedCondition(eq("code", code));
        return Jmongo.query(entityClass, condition, 0, 1).findFirst().run().toCompletableFuture().get();
    }

    @Override
    public CompletionStage<PackageBoxQuery.Result> query(PackageBoxQuery packageBoxQuery) {
        final int first = packageBoxQuery.getFirst();
        final int pageSize = packageBoxQuery.getPageSize();
        final PackageBoxQuery.Result.ResultBuilder builder = PackageBoxQuery.Result.builder().first(first).pageSize(pageSize);
        return ReactiveStreams.of(packageBoxQuery)
                .map(packageBoxLucene::build)
                .map(it -> packageBoxLucene.baseQuery(it, first, pageSize))
                .peek(it -> builder.count(it.getKey()))
                .map(Pair::getValue)
                .flatMap(ids -> Jmongo.listById(entityClass, ids))
                .toList().run()
                .thenApply(packageBoxes -> builder.packageBoxes(packageBoxes).build());
    }

    @Override
    public CompletionStage<PackageBoxQueryForMeasure.Result> query(PackageBoxQueryForMeasure packageBoxQuery) {
        final int first = packageBoxQuery.getFirst();
        final int pageSize = packageBoxQuery.getPageSize();
        final PackageBoxQueryForMeasure.Result.ResultBuilder builder = PackageBoxQueryForMeasure.Result.builder().first(first).pageSize(pageSize);
        final Sort sort = new Sort(new SortedNumericSortField("createDateTime", SortField.Type.LONG, true));
        return ReactiveStreams.of(packageBoxQuery)
                .map(packageBoxLucene::build)
                .map(it -> packageBoxLucene.baseQuery(it, first, pageSize, sort))
                .peek(it -> builder.count(it.getKey()))
                .map(Pair::getValue)
                .flatMap(ids -> Jmongo.listById(entityClass, ids))
                .toList().run()
                .thenApply(packageBoxes -> builder.packageBoxes(packageBoxes).build());
    }

}
