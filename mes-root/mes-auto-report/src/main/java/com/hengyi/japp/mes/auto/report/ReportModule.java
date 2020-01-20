package com.hengyi.japp.mes.auto.report;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Guice;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import com.hengyi.japp.mes.auto.GuiceModule;
import com.hengyi.japp.mes.auto.report.config.MesAutoJmongo;
import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.reactivestreams.client.MongoClient;
import com.mongodb.reactivestreams.client.MongoClients;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;

/**
 * @author jzb 2019-05-20
 */
public class ReportModule extends GuiceModule {

    synchronized public static void init(Vertx vertx) {
        if (INJECTOR == null) {
            VERTX = vertx;
            INJECTOR = Guice.createInjector(new ReportModule());
        }
    }

    @Provides
    @Singleton
    private Jmongo Jmongo() {
        return Jmongo.of(MesAutoJmongo.class);
    }

    @Provides
    @Singleton
    private MongoClient MongoClient(@Named("vertxConfig") JsonObject vertxConfig) {
        final JsonObject config = vertxConfig.getJsonObject("mongo", new JsonObject());
        final String connection_string = config.getString("connection_string");
        final MongoClientSettings.Builder builder = MongoClientSettings.builder()
                .applyConnectionString(new ConnectionString(connection_string));
        return MongoClients.create(builder.build());
    }
}
