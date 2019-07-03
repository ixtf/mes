package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.Login;
import com.hengyi.japp.mes.auto.repository.LoginRepository;
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
public class LoginRepositoryMongo extends MongoEntityRepository<Login> implements LoginRepository {

    @Override
    public Login save(Login login) {
        login.setId(login.getOperator().getId());
        return super.save(login);
    }

    @SneakyThrows
    @Override
    public Optional<Login> findByLoginId(String loginId) {
        final Bson condition = unDeletedCondition(eq("loginId", loginId));
        return Jmongo.query(entityClass, condition, 0, 1).findFirst().run().toCompletableFuture().get();
    }
}
