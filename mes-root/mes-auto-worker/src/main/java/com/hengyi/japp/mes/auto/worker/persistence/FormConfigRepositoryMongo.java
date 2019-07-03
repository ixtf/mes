package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.japp.core.J;
import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.query.FormConfigQuery;
import com.hengyi.japp.mes.auto.domain.FormConfig;
import com.hengyi.japp.mes.auto.repository.FormConfigRepository;
import com.mongodb.client.model.Filters;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.bson.conversions.Bson;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;
import org.eclipse.microprofile.reactive.streams.operators.ReactiveStreams;

import java.util.Optional;
import java.util.concurrent.CompletionStage;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static java.util.regex.Pattern.CASE_INSENSITIVE;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class FormConfigRepositoryMongo extends MongoEntityRepository<FormConfig> implements FormConfigRepository {

    @Override
    public PublisherBuilder<FormConfig> autoComplete(String q) {
        if (StringUtils.isBlank(q)) {
            return ReactiveStreams.empty();
        }
        final Pattern pattern = Pattern.compile(q, CASE_INSENSITIVE);
        final Bson qFilter = Filters.regex("name", pattern);
        final Bson condition = unDeletedCondition(qFilter);
        return Jmongo.query(entityClass, condition, 0, 10);
    }

    @Override
    public CompletionStage<FormConfigQuery.Result> query(FormConfigQuery formConfigQuery) {
        final int first = formConfigQuery.getFirst();
        final int pageSize = formConfigQuery.getPageSize();
        final var builder = FormConfigQuery.Result.builder().first(first).pageSize(pageSize);
        final Stream<Bson> qFilter = Optional.ofNullable(formConfigQuery.getQ())
                .filter(J::nonBlank)
                .map(q -> {
                    final Pattern pattern = Pattern.compile(q, CASE_INSENSITIVE);
                    return Filters.regex("name", pattern);
                })
                .stream();
        final Bson condition = unDeletedCondition(qFilter);
        final var query = Jmongo.query(entityClass, condition, first, pageSize).toList().run();
        final long count = Jmongo.count(entityClass, condition);
        builder.count(count);
        return query.thenApply(it -> builder.formConfigs(it).build());
    }
}
