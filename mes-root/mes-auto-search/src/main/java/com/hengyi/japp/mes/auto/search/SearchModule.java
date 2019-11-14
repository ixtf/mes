package com.hengyi.japp.mes.auto.search;

import com.google.inject.Guice;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.GuiceModule;
import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.reactivestreams.client.MongoClient;
import com.mongodb.reactivestreams.client.MongoClients;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;

import javax.inject.Named;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 描述：
 *
 * @author jzb 2018-03-21
 */
public class SearchModule extends GuiceModule {

    synchronized public static void init(Vertx vertx) {
        if (INJECTOR == null) {
            VERTX = vertx;
            INJECTOR = Guice.createInjector(new SearchModule());
        }
    }

    @Provides
    @Singleton
    @Named("rootPath")
    private Path rootPath() {
        return Paths.get(System.getProperty("mes.auto.search.path", "/home/mes/search"));
    }

    @Provides
    @Singleton
    @Named("luceneRootPath")
    private Path luceneRootPath(@Named("rootPath") Path rootPath) {
        return rootPath.resolve("lucene");
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
