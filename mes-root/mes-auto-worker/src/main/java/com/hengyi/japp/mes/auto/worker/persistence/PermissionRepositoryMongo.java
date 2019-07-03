package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.Permission;
import com.hengyi.japp.mes.auto.repository.PermissionRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.bson.conversions.Bson;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;
import org.eclipse.microprofile.reactive.streams.operators.ReactiveStreams;

import java.util.regex.Pattern;

import static com.mongodb.client.model.Filters.or;
import static com.mongodb.client.model.Filters.regex;
import static java.util.regex.Pattern.CASE_INSENSITIVE;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class PermissionRepositoryMongo extends MongoEntityRepository<Permission> implements PermissionRepository {

    @Override
    public PublisherBuilder<Permission> autoComplete(String q) {
        if (StringUtils.isBlank(q)) {
            return ReactiveStreams.empty();
        }
        final Pattern pattern = Pattern.compile(q, CASE_INSENSITIVE);
        final Bson qFilter = regex("name", pattern);
        final Bson codeFilter = regex("code", pattern);
        final Bson condition = unDeletedCondition(or(qFilter, codeFilter));
        return Jmongo.query(entityClass, condition, 0, 10);
    }
}
