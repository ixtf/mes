package com.hengyi.japp.mes.auto.search;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.*;
import com.hengyi.japp.mes.auto.search.config.SearchJmongoOptions;
import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.reactivestreams.client.MongoClient;
import com.mongodb.reactivestreams.client.MongoClients;
import com.rabbitmq.client.Address;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import lombok.SneakyThrows;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.rabbitmq.*;

import javax.inject.Named;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

import static com.github.ixtf.japp.core.Constant.MAPPER;
import static com.github.ixtf.japp.core.Constant.YAML_MAPPER;
import static reactor.rabbitmq.Utils.singleConnectionMono;

/**
 * 描述：
 *
 * @author jzb 2018-03-21
 */
public class SearchModule extends AbstractModule {
    private static Injector INJECTOR;
    private static Vertx VERTX;

    synchronized public static void init(Vertx vertx) {
        if (INJECTOR == null) {
            VERTX = vertx;
            INJECTOR = Guice.createInjector(new SearchModule());
        }
    }

    public static <T> T getInstance(Class<T> clazz) {
        return INJECTOR.getInstance(clazz);
    }

    public static <T> T getInstance(Key<T> key) {
        return INJECTOR.getInstance(key);
    }

    public static void injectMembers(Object o) {
        INJECTOR.injectMembers(o);
    }

    @Override
    protected void configure() {
        bind(Vertx.class).toInstance(VERTX);
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

    @SneakyThrows(IOException.class)
    @Provides
    @Singleton
    @Named("vertxConfig")
    private JsonObject vertxConfig(@Named("rootPath") Path rootPath) {
        final File ymlFile = rootPath.resolve("config.yml").toFile();
        if (ymlFile.exists()) {
            final Map map = YAML_MAPPER.readValue(ymlFile, Map.class);
            return new JsonObject(map);
        }
        final File jsonFile = rootPath.resolve("config.json").toFile();
        final Map map = MAPPER.readValue(jsonFile, Map.class);
        return new JsonObject(map);
    }

    @Provides
    @Singleton
    private Jmongo Jmongo() {
        return Jmongo.of(SearchJmongoOptions.class);
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

    @Provides
    @Singleton
    private Receiver Receiver(@Named("vertxConfig") JsonObject vertxConfig) {
        final JsonObject config = vertxConfig.getJsonObject("rabbit", new JsonObject());
        final String host = config.getString("host", "192.168.0.38");
        final String username = config.getString("username", "admin");
        final String password = config.getString("password", "tomking");
        final String clientProvidedName = config.getString("clientProvidedName", "mes-auto-search-receiver");

        final ConnectionFactory connectionFactory = new ConnectionFactory();
        connectionFactory.useNio();
        connectionFactory.setUsername(username);
        connectionFactory.setPassword(password);
        final ReceiverOptions receiverOptions = new ReceiverOptions()
                .connectionFactory(connectionFactory)
                .connectionSupplier(cf -> {
                    final Address address = new Address(host);
                    return cf.newConnection(new Address[]{address}, clientProvidedName);
                });
        return RabbitFlux.createReceiver(receiverOptions);
    }

    @Provides
    @Singleton
    private Sender Sender(@Named("vertxConfig") JsonObject vertxConfig) {
        final JsonObject config = vertxConfig.getJsonObject("rabbit", new JsonObject());
        final String host = config.getString("host", "192.168.0.38");
        final String username = config.getString("username", "admin");
        final String password = config.getString("password", "tomking");
        final String clientProvidedName = config.getString("clientProvidedName", "mes-auto-search-sender");

        final ConnectionFactory connectionFactory = new ConnectionFactory();
        connectionFactory.useNio();
        connectionFactory.setUsername(username);
        connectionFactory.setPassword(password);
        final Mono<? extends Connection> connectionMono = singleConnectionMono(() -> {
            final Address address = new Address(host);
            final Address[] addrs = {address};
            return connectionFactory.newConnection(addrs, clientProvidedName);
        });
        final ChannelPoolOptions channelPoolOptions = new ChannelPoolOptions().maxCacheSize(10);
        final SenderOptions senderOptions = new SenderOptions()
                .connectionFactory(connectionFactory)
                .connectionMono(connectionMono)
                .resourceManagementScheduler(Schedulers.elastic())
                .channelPool(ChannelPoolFactory.createChannelPool(connectionMono, channelPoolOptions));
        return RabbitFlux.createSender(senderOptions);
    }

}
