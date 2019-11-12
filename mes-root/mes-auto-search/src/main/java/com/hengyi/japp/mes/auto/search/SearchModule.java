package com.hengyi.japp.mes.auto.search;

import com.google.inject.*;
import com.rabbitmq.client.Address;
import com.rabbitmq.client.ConnectionFactory;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import reactor.rabbitmq.RabbitFlux;
import reactor.rabbitmq.Receiver;
import reactor.rabbitmq.ReceiverOptions;

import javax.inject.Named;

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

    @Override
    protected void configure() {
        bind(Vertx.class).toInstance(VERTX);
    }

    @Provides
    @Singleton
    private Receiver Receiver(@Named("vertxConfig") JsonObject vertxConfig) {
        final JsonObject config = vertxConfig.getJsonObject("rabbit", new JsonObject());
        final String host = config.getString("host");
        final String username = config.getString("username");
        final String password = config.getString("password");
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

}
