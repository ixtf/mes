package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.query.SilkCarQuery;
import com.hengyi.japp.mes.auto.domain.SilkCar;
import com.hengyi.japp.mes.auto.repository.SilkCarRepository;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.bson.conversions.Bson;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;
import org.eclipse.microprofile.reactive.streams.operators.ReactiveStreams;

import java.util.Optional;
import java.util.concurrent.CompletionStage;
import java.util.regex.Pattern;

import static com.mongodb.client.model.Filters.*;
import static com.mongodb.client.model.Sorts.ascending;
import static java.util.regex.Pattern.CASE_INSENSITIVE;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class SilkCarRepositoryMongo extends MongoEntityRepository<SilkCar> implements SilkCarRepository {

    @SneakyThrows
    @Override
    public Optional<SilkCar> findByCode(String code) {
        final Bson condition = unDeletedCondition(eq("code", code));
        return Jmongo.query(entityClass, condition, 0, 1).findFirst().run().toCompletableFuture().get();
    }

    @Override
    public PublisherBuilder<SilkCar> autoComplete(String q) {
        if (StringUtils.isBlank(q)) {
            return ReactiveStreams.empty();
        }
        final Pattern pattern = Pattern.compile(q, CASE_INSENSITIVE);
        final Bson qFilter = regex("code", pattern);
        final Bson condition = unDeletedCondition(qFilter);
        return Jmongo.query(entityClass, condition, 0, 10);
    }

    @Override
    public CompletionStage<SilkCarQuery.Result> query(SilkCarQuery silkCarQuery) {
        final int first = silkCarQuery.getFirst();
        final int pageSize = silkCarQuery.getPageSize();
        final var builder = SilkCarQuery.Result.builder().first(first).pageSize(pageSize);
        final Optional<Bson> codeBson = Optional.ofNullable(silkCarQuery.getQ())
                .filter(StringUtils::isNotBlank)
                .map(q -> {
                    final Pattern pattern = Pattern.compile(q, CASE_INSENSITIVE);
                    return regex("code", pattern);
                });
        final Bson condition = unDeletedCondition(codeBson);
        final var query = Jmongo.query(entityClass, and(condition, ascending("code")), first, pageSize).toList().run();
        builder.count(Jmongo.count(entityClass, condition));
        return query.thenApply(it -> builder.silkCars(it).build());
    }
}
