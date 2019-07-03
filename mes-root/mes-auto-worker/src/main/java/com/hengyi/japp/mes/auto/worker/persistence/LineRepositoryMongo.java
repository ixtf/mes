package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.query.LineQuery;
import com.hengyi.japp.mes.auto.domain.Line;
import com.hengyi.japp.mes.auto.repository.LineRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.bson.conversions.Bson;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;
import org.eclipse.microprofile.reactive.streams.operators.ReactiveStreams;

import java.util.Optional;
import java.util.concurrent.CompletionStage;
import java.util.regex.Pattern;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;
import static java.util.regex.Pattern.CASE_INSENSITIVE;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class LineRepositoryMongo extends MongoEntityRepository<Line> implements LineRepository {

    @Override
    public PublisherBuilder<Line> autoComplete(String q) {
        if (StringUtils.isBlank(q)) {
            return ReactiveStreams.empty();
        }
        final Pattern pattern = Pattern.compile(q, CASE_INSENSITIVE);
        final Bson qFilter = regex("name", pattern);
        final Bson condition = unDeletedCondition(qFilter);
        return Jmongo.query(entityClass, condition, 0, 10);
    }

    @Override
    public CompletionStage<LineQuery.Result> query(LineQuery lineQuery) {
        final int first = lineQuery.getFirst();
        final int pageSize = lineQuery.getPageSize();
        final LineQuery.Result.ResultBuilder builder = LineQuery.Result.builder().first(first).pageSize(pageSize);

        final Optional<Bson> workshop = Optional.ofNullable(lineQuery.getWorkshopId())
                .filter(StringUtils::isNotBlank)
                .map(workshopId -> eq("workshop", workshopId));
        final Optional<Bson> name = Optional.ofNullable(lineQuery.getQ())
                .filter(StringUtils::isNotBlank)
                .map(q -> {
                    final Pattern pattern = Pattern.compile(q, CASE_INSENSITIVE);
                    return regex("name", pattern);
                });
        final Bson condition = unDeletedCondition(workshop, name);
        var query = Jmongo.query(entityClass, condition, first, pageSize).toList().run();
        final long count = Jmongo.count(entityClass, condition);
        builder.count(count);
        return query.thenApply(it -> builder.lines(it).build());
    }

    @Override
    public PublisherBuilder<Line> listByWorkshopId(String id) {
        final Bson condition = unDeletedCondition(eq("workshop", id));
        return Jmongo.query(entityClass, condition);
    }

}
