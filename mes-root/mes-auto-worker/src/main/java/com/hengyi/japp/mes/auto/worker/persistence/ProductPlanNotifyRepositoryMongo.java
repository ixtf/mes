package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.query.ProductPlanNotifyQuery;
import com.hengyi.japp.mes.auto.domain.ProductPlanNotify;
import com.hengyi.japp.mes.auto.repository.ProductPlanNotifyRepository;
import com.mongodb.client.model.Filters;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.bson.conversions.Bson;

import java.util.Optional;
import java.util.concurrent.CompletionStage;
import java.util.regex.Pattern;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Sorts.descending;
import static java.util.regex.Pattern.CASE_INSENSITIVE;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class ProductPlanNotifyRepositoryMongo extends MongoEntityRepository<ProductPlanNotify> implements ProductPlanNotifyRepository {

    @Override
    public CompletionStage<ProductPlanNotifyQuery.Result> query(ProductPlanNotifyQuery productPlanNotifyQuery) {
        final int first = productPlanNotifyQuery.getFirst();
        final int pageSize = productPlanNotifyQuery.getPageSize();
        final var builder = ProductPlanNotifyQuery.Result.builder().first(first).pageSize(pageSize);
        final Bson qFilter = Optional.ofNullable(productPlanNotifyQuery.getQ())
                .filter(StringUtils::isNotBlank)
                .map(q -> {
                    final Pattern pattern = Pattern.compile(q, CASE_INSENSITIVE);
                    return Filters.regex("name", pattern);
                })
                .orElse(null);
        final Bson condition = unDeletedCondition(qFilter);
        final var query = Jmongo.query(entityClass, and(condition, descending("startDate")), first, pageSize).toList().run();
        builder.count(Jmongo.count(entityClass, condition));
        return query.thenApply(it -> builder.productPlanNotifies(it).build());
    }
}
