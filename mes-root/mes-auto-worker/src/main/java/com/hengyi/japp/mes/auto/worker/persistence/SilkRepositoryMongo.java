package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.query.SilkQuery;
import com.hengyi.japp.mes.auto.domain.Silk;
import com.hengyi.japp.mes.auto.repository.SilkRepository;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import org.bson.conversions.Bson;
import org.eclipse.microprofile.reactive.streams.operators.ReactiveStreams;

import java.util.Optional;
import java.util.concurrent.CompletionStage;

import static com.mongodb.client.model.Filters.eq;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class SilkRepositoryMongo extends MongoEntityRepository<Silk> implements SilkRepository {
    private final SilkLucene silkLucene;

    @Inject
    private SilkRepositoryMongo(SilkLucene silkLucene) {
        this.silkLucene = silkLucene;
    }

    @Override
    public Silk save(Silk silk) {
        final Silk result = super.save(silk);
        silkLucene.index(result);
        return result;
    }

    @SneakyThrows
    @Override
    public Optional<Silk> findByCode(String code) {
        final Bson condition = unDeletedCondition(eq("code", code));
        return Jmongo.query(entityClass, condition, 0, 1).findFirst().run().toCompletableFuture().get();
    }

    @Override
    public CompletionStage<SilkQuery.Result> query(SilkQuery silkQuery) {
        final int first = silkQuery.getFirst();
        final int pageSize = silkQuery.getPageSize();
        final SilkQuery.Result.ResultBuilder builder = SilkQuery.Result.builder().first(first).pageSize(pageSize);
        return ReactiveStreams.of(silkQuery)
                .map(silkLucene::build)
                .map(it -> silkLucene.baseQuery(it, first, pageSize))
                .peek(it -> builder.count(it.getKey()))
                .map(Pair::getValue)
                .flatMap(ids -> Jmongo.listById(entityClass, ids))
                .toList().run()
                .thenApply(silks -> builder.silks(silks).build());
    }

}
