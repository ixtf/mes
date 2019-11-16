package com.hengyi.japp.mes.auto;

import com.google.inject.Key;
import com.google.inject.*;
import com.hengyi.japp.mes.auto.config.MesAutoConfig;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.jwt.JWTAuth;
import lombok.SneakyThrows;

import javax.inject.Named;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.security.*;
import java.security.cert.CertificateException;
import java.util.Map;

import static com.github.ixtf.japp.core.Constant.MAPPER;
import static com.github.ixtf.japp.core.Constant.YAML_MAPPER;

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
