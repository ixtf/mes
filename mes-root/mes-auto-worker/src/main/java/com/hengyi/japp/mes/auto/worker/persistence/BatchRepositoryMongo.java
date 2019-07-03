package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.query.BatchQuery;
import com.hengyi.japp.mes.auto.domain.Batch;
import com.hengyi.japp.mes.auto.repository.BatchRepository;
import com.mongodb.client.model.Filters;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.bson.conversions.Bson;

import java.util.Optional;
import java.util.concurrent.CompletionStage;
import java.util.regex.Pattern;

import static com.mongodb.client.model.Filters.eq;
import static java.util.regex.Pattern.CASE_INSENSITIVE;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class BatchRepositoryMongo extends MongoEntityRepository<Batch> implements BatchRepository {

    @SneakyThrows
    @Override
    public Optional<Batch> findByBatchNo(String batchNo) {
        if (StringUtils.isBlank(batchNo)) {
            return Optional.empty();
        }
        final Bson condition = unDeletedCondition(eq("batchNo", batchNo));
        return Jmongo.query(entityClass, condition, 0, 1)
                .findFirst().run().toCompletableFuture().get();
    }

    @Override
    public CompletionStage<BatchQuery.Result> query(BatchQuery batchQuery) {
        final int first = batchQuery.getFirst();
        final int pageSize = batchQuery.getPageSize();
        final BatchQuery.Result.ResultBuilder builder = BatchQuery.Result.builder().first(first).pageSize(pageSize);

        final Bson workshopFilter = Optional.ofNullable(batchQuery.getWorkshopId())
                .filter(StringUtils::isNotBlank)
                .map(it -> Filters.eq("workshop", it))
                .orElse(null);
        final Bson qFilter = Optional.ofNullable(batchQuery.getQ())
                .filter(StringUtils::isNotBlank)
                .map(q -> {
                    final Pattern pattern = Pattern.compile(q, CASE_INSENSITIVE);
                    return Filters.regex("batchNo", pattern);
                })
                .orElse(null);
        final Bson condition = unDeletedCondition(workshopFilter, qFilter);

        return Jmongo.query(entityClass, condition, first, pageSize)
                .toList().run().thenApply(batches -> {
                    final long count = Jmongo.count(entityClass, condition);
                    return builder.batches(batches).count(count).build();
                }).toCompletableFuture();
    }

}
