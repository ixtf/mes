package com.hengyi.japp.mes.auto.search;

import com.github.ixtf.japp.core.J;
import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Guice;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.GuiceModule;
import com.hengyi.japp.mes.auto.search.config.MesAutoJmongo;
import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.reactivestreams.client.MongoClient;
import com.mongodb.reactivestreams.client.MongoClients;
import com.rabbitmq.client.Address;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.rabbitmq.*;

import javax.inject.Named;
import java.nio.file.Path;
import java.time.Duration;

import static java.util.Optional.ofNullable;
import static reactor.rabbitmq.Utils.singleConnectionMono;

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
        final String path = ofNullable(System.getProperty("mes.auto.search.path"))
                .filter(J::nonBlank)
                .or(() -> ofNullable(System.getenv("mes.auto.search.path")))
                .filter(J::nonBlank)
                .orElse("/home/mes/search");
        return Path.of(path);
    }

    @Provides
    @Singleton
    @Named("lucenePath")
    private Path lucenePath(@Named("rootPath") Path rootPath) {
        return rootPath.resolve("lucene");
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

    @Provides
    @Singleton
    private SendOptions SendOptions() {
        return new SendOptions().exceptionHandler(
                new ExceptionHandlers.RetrySendingExceptionHandler(
                        Duration.ofHours(1), Duration.ofMinutes(5),
                        ExceptionHandlers.CONNECTION_RECOVERY_PREDICATE
                )
        );
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
    private ConsumeOptions ConsumeOptions() {
        return new ConsumeOptions().exceptionHandler(
                new ExceptionHandlers.RetryAcknowledgmentExceptionHandler(
                        Duration.ofDays(1), Duration.ofSeconds(5),
                        ExceptionHandlers.CONNECTION_RECOVERY_PREDICATE
                )
        );
    }

}
