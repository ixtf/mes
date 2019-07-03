package com.hengyi.japp.mes.auto;

import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.config.MesAutoConfig;
import io.vertx.reactivex.core.Vertx;
import io.vertx.reactivex.ext.auth.jwt.JWTAuth;
import io.vertx.reactivex.rabbitmq.RabbitMQClient;

import java.io.IOException;
import java.security.*;
import java.security.cert.CertificateException;

/**
 * @author jzb 2018-03-21
 */
public class GuiceModule extends AbstractModule {
    protected final Vertx vertx;

    public GuiceModule(Vertx vertx) {
        this.vertx = vertx;
    }

    @Provides
    @Singleton
    private RabbitMQClient RabbitMQClient() {
        return RabbitMQClient.create(vertx, MesAutoConfig.rabbitMQOptions());
    }

    @Provides
    @Singleton
    private JWTAuth JWTAuth() {
        return JWTAuth.create(vertx, MesAutoConfig.jwtAuthOptions());
    }

    @Provides
    @Singleton
    private KeyStore keystore() throws IOException, KeyStoreException, CertificateException, NoSuchAlgorithmException {
        return MesAutoConfig.getKeyStore();
    }

    @Provides
    @Singleton
    private PrivateKey PrivateKey(KeyStore keyStore) throws KeyStoreException, NoSuchAlgorithmException, UnrecoverableKeyException {
        return (PrivateKey) keyStore.getKey("esb-open", "esb-open-tomking".toCharArray());
    }

    @Provides
    private Vertx vertx() {
        return vertx;
    }

}
