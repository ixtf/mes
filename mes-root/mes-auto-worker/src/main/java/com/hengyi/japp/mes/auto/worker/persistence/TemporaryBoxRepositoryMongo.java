package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.TemporaryBox;
import com.hengyi.japp.mes.auto.repository.TemporaryBoxRepository;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.bson.conversions.Bson;

import java.util.Optional;

import static com.github.ixtf.persistence.mongo.Jmongo.ID_COL;
import static com.mongodb.client.model.Filters.eq;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class TemporaryBoxRepositoryMongo extends MongoEntityRepository<TemporaryBox> implements TemporaryBoxRepository {

    @SneakyThrows
    @Override
    public Optional<TemporaryBox> findByCode(String code) {
        final Bson condition = unDeletedCondition(eq("code", code));
        return Jmongo.query(entityClass, condition, 0, 1).findFirst().run().toCompletableFuture().get();
    }

    @Override
    public void rxInc(String id, int count) {
        final Bson update = new Document().append("$inc", new Document().append("count", count));
        Jmongo.collection(entityClass).findOneAndUpdate(eq(ID_COL, id), update);
    }
}
