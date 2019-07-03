package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.japp.core.J;
import com.github.ixtf.persistence.IEntity;
import com.github.ixtf.persistence.mongo.Jmongo;
import com.github.ixtf.persistence.mongo.api.MongoUnitOfWork;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Sorts;
import lombok.SneakyThrows;
import org.apache.commons.lang3.StringUtils;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;

import java.lang.reflect.ParameterizedType;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Stream;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.ne;

/**
 * @author jzb 2018-06-29
 */
public abstract class MongoEntityRepository<T extends IEntity> {
    protected final Class<T> entityClass;

    protected MongoEntityRepository() {
        entityClass = entityClass();
    }

    public static Bson unDeletedCondition(Stream<Bson> stream) {
        final Stream<Bson> stream1 = Stream.of(ne("deleted", true));
        return Stream.concat(stream1, stream)
                .filter(Objects::nonNull)
                .reduce(Filters::and)
                .get();
    }

    public static Bson unDeletedCondition(Optional<Bson>... filters) {
        final Stream<Bson> stream = Optional.ofNullable(filters).stream()
                .flatMap(Stream::of)
                .flatMap(Optional::stream);
        return unDeletedCondition(stream);
    }

    public static Bson unDeletedCondition(Bson... filters) {
        final Stream<Bson> stream = Optional.ofNullable(filters).stream().flatMap(Stream::of);
        return unDeletedCondition(stream);
    }

    public static Bson ascendingQuery(String... fieldNames) {
        return Optional.of(fieldNames)
                .map(Sorts::ascending)
                .get();
    }

    public static Bson descendingQuery(String... fieldNames) {
        return Optional.of(fieldNames)
                .map(Sorts::descending)
                .get();
    }

    public static Bson sortQuery(Bson... sorts) {
        return Optional.of(sorts)
                .map(Sorts::orderBy)
                .get();
    }

    private Class<T> entityClass() {
        ParameterizedType parameterizedType = (ParameterizedType) this.getClass().getGenericSuperclass();
        return (Class<T>) parameterizedType.getActualTypeArguments()[0];
    }

    public Optional<T> find(String id) {
        return Jmongo.findById(entityClass, id);
    }

    public Optional<T> find(EntityDTO dto) {
        return Optional.ofNullable(dto)
                .map(EntityDTO::getId)
                .flatMap(this::find);
    }

    @SneakyThrows
    public Optional<T> findByName(String name) {
        if (StringUtils.isBlank(name)) {
            return Optional.empty();
        }
        final Bson condition = unDeletedCondition(eq("name", name));
        return Jmongo.query(entityClass, condition, 0, 1)
                .findFirst().run().toCompletableFuture().get();
    }

    public T save(T entity) {
        if (J.isBlank(entity.getId())) {
            entity.setId(new ObjectId().toHexString());
        }
        final MongoUnitOfWork uow = Jmongo.uow();
        if (Jmongo.existsById(entityClass, entity.getId())) {
            uow.registerDirty(entity);
        } else {
            uow.registerNew(entity);
        }
        uow.commit();
        return entity;
    }

    public PublisherBuilder<T> list() {
        return Jmongo.listAll(entityClass);
    }
}
