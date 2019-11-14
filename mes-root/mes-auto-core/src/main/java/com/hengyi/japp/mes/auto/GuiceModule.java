package com.hengyi.japp.mes.auto;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Key;
import com.google.inject.*;
import com.hengyi.japp.mes.auto.config.MesAutoConfig;
import com.hengyi.japp.mes.auto.config.MesAutoJmongo;
import com.rabbitmq.client.Address;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.jwt.JWTAuth;
import lombok.SneakyThrows;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.rabbitmq.*;

import javax.inject.Named;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.security.*;
import java.security.cert.CertificateException;
import java.util.Map;

import static com.github.ixtf.japp.core.Constant.MAPPER;
import static com.github.ixtf.japp.core.Constant.YAML_MAPPER;
import static reactor.rabbitmq.Utils.singleConnectionMono;

/**
 * @author jzb 2018-03-21
 */
public class GuiceModule extends AbstractModule {
    protected static Injector INJECTOR;
    protected static Vertx VERTX;

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
        return Jmongo.of(MesAutoJmongo.class);
    }

    @Provides
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
    private JWTAuth JWTAuth(Vertx vertx) {
        return JWTAuth.create(vertx, MesAutoConfig.jwtAuthOptions());
    }

    @Provides
    @Singleton
    private KeyStore KeyStore() throws IOException, KeyStoreException, CertificateException, NoSuchAlgorithmException {
        return MesAutoConfig.getKeyStore();
    }

    @Provides
    @Singleton
    private PrivateKey PrivateKey(KeyStore keyStore) throws KeyStoreException, NoSuchAlgorithmException, UnrecoverableKeyException {
        return (PrivateKey) keyStore.getKey("esb-open", "esb-open-tomking".toCharArray());
    }

}
