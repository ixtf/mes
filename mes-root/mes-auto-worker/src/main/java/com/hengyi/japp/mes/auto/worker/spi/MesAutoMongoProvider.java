package com.hengyi.japp.mes.auto.worker.spi;

import com.github.ixtf.japp.core.J;
import com.github.ixtf.persistence.mongo.spi.MongoProvider;
import com.hengyi.japp.mes.auto.config.MesAutoConfig;
import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.MongoCredential;
import com.mongodb.reactivestreams.client.MongoClient;
import com.mongodb.reactivestreams.client.MongoClients;
import io.vertx.core.json.JsonObject;

import static com.hengyi.japp.mes.auto.worker.Worker.INJECTOR;
import static com.mongodb.MongoCredential.createScramSha1Credential;

/**
 * @author jzb 2018-11-01
 */
public class MesAutoMongoProvider implements MongoProvider {
    @Override
    public MongoClient client() {
        final MesAutoConfig config = INJECTOR.getInstance(MesAutoConfig.class);
        final JsonObject mongoOptions = config.getMongoOptions();
        final String host = mongoOptions.getString("host");
        final Integer port = mongoOptions.getInteger("port", 27017);
        final ConnectionString connectionString = new ConnectionString("mongodb://" + host + ":" + port);
        final MongoClientSettings.Builder builder = MongoClientSettings.builder().applyConnectionString(connectionString);
        final String username = mongoOptions.getString("username");
        if (J.nonBlank(username)) {
            final String authSource = mongoOptions.getString("authSource");
            final char[] password = mongoOptions.getString("password").toCharArray();
            final MongoCredential credential = createScramSha1Credential(username, authSource, password);
            builder.credential(credential);
        }
        return MongoClients.create(builder.build());
    }

    @Override
    public String dbName() {
        return "mes-auto";
    }

}
