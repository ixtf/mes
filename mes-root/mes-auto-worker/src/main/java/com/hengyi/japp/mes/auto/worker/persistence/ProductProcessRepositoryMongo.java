package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.ProductProcess;
import com.hengyi.japp.mes.auto.repository.ProductProcessRepository;
import lombok.extern.slf4j.Slf4j;
import org.bson.conversions.Bson;

import java.util.List;
import java.util.concurrent.CompletionStage;

import static com.mongodb.client.model.Filters.eq;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class ProductProcessRepositoryMongo extends MongoEntityRepository<ProductProcess> implements ProductProcessRepository {

    @Override
    public CompletionStage<List<ProductProcess>> listByProductId(String productId) {
        final Bson condition = unDeletedCondition(eq("product", productId));
        return Jmongo.query(entityClass, condition).toList().run();
    }

}
