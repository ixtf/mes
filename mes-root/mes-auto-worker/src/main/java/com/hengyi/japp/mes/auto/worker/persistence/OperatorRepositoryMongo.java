package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.query.OperatorQuery;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.repository.OperatorRepository;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.bson.conversions.Bson;

import java.util.Optional;
import java.util.concurrent.CompletionStage;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static com.mongodb.client.model.Filters.*;
import static java.util.regex.Pattern.CASE_INSENSITIVE;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class OperatorRepositoryMongo extends MongoEntityRepository<Operator> implements OperatorRepository {

    @Override
    public Optional<Operator> findByLoginId(String loginId) {
        return Stream.concat(
                findByHrId(loginId).stream(),
                findByOaId(loginId).stream()
        ).findAny();
    }

    @SneakyThrows
    @Override
    public Optional<Operator> findByHrId(String hrId) {
        final Bson condition = unDeletedCondition(eq("hrId", hrId));
        return Jmongo.query(entityClass, condition, 0, 1).findFirst().run().toCompletableFuture().get();
    }

    @SneakyThrows
    @Override
    public Optional<Operator> findByOaId(String oaId) {
        final Bson condition = unDeletedCondition(eq("oaId", oaId));
        return Jmongo.query(entityClass, condition, 0, 1).findFirst().run().toCompletableFuture().get();
    }

    @Override
    public CompletionStage<OperatorQuery.Result> query(OperatorQuery operatorQuery) {
        final int first = operatorQuery.getFirst();
        final int pageSize = operatorQuery.getPageSize();
        final var builder = OperatorQuery.Result.builder().first(first).pageSize(pageSize);
        final Bson qFilter = Optional.ofNullable(operatorQuery.getQ())
                .filter(StringUtils::isNotBlank)
                .map(q -> {
                    final Pattern pattern = Pattern.compile(q, CASE_INSENSITIVE);
                    final Bson hrId = regex("hrId", pattern);
                    final Bson oaId = regex("oaId", pattern);
                    final Bson name = regex("name", pattern);
                    return or(hrId, oaId, name);
                })
                .orElse(null);
        final Bson condition = unDeletedCondition(qFilter);
        final var query = Jmongo.query(entityClass, condition, first, pageSize).toList().run();
        builder.count(Jmongo.count(entityClass, condition));
        return query.thenApply(it -> builder.operators(it).build());
    }

}
