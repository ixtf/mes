package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.DyeingSample;
import com.hengyi.japp.mes.auto.domain.Silk;
import com.hengyi.japp.mes.auto.repository.DyeingSampleRepository;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.bson.conversions.Bson;

import java.util.Optional;

import static com.mongodb.client.model.Filters.eq;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class DyeingSampleRepositoryMongo extends MongoEntityRepository<DyeingSample> implements DyeingSampleRepository {

    @Override
    public DyeingSample save(DyeingSample dyeingSample) {
        final String id = Optional.ofNullable(dyeingSample.getSilk())
                .map(Silk::getId)
                .orElse(dyeingSample.getCode());
        dyeingSample.setId(id);
        return super.save(dyeingSample);
    }

    @SneakyThrows
    @Override
    public Optional<DyeingSample> findByCode(String code) {
        final Bson condition = MongoEntityRepository.unDeletedCondition(eq("code", code));
        return Jmongo.query(entityClass, condition).findFirst().run().toCompletableFuture().get();
    }
}
