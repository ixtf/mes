package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.Line;
import com.hengyi.japp.mes.auto.domain.LineMachine;
import com.hengyi.japp.mes.auto.repository.LineMachineRepository;
import lombok.SneakyThrows;
import org.bson.conversions.Bson;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;

import java.util.Optional;

import static com.mongodb.client.model.Filters.eq;

/**
 * @author jzb 2018-06-25
 */
@Singleton
public class LineMachineRepositoryMongo extends MongoEntityRepository<LineMachine> implements LineMachineRepository {

    @Override
    public PublisherBuilder<LineMachine> listByLineId(String lineId) {
        final Bson condition = unDeletedCondition(eq("line", lineId));
        return Jmongo.query(entityClass, condition);
    }

    @SneakyThrows
    @Override
    public Optional<LineMachine> find(Line line, int item) {
        final Bson condition = unDeletedCondition(eq("line", line.getId()), eq("item", item));
        return Jmongo.query(entityClass, condition).findFirst()
                .run().toCompletableFuture().get();
    }

}
