package com.hengyi.japp.mes.auto.config;

import com.hengyi.japp.mes.auto.Util;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.PubSecKeyOptions;
import io.vertx.ext.auth.jwt.JWTAuthOptions;
import io.vertx.rabbitmq.RabbitMQOptions;
import io.vertx.reactivex.core.Vertx;
import io.vertx.reactivex.ext.jdbc.JDBCClient;
import lombok.Getter;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.time.LocalDate;

/**
 * @author jzb 2019-02-23
 */
public class MesAutoConfig {
    private static final Path PATH = Paths.get(System.getProperty("japp.mes.auto.path", "/home/mes/auto"));
    private static final JsonObject CONFIG = Util.readJsonObject(PATH.resolve("config.yml"));
    private static final Path apkPath = PATH.resolve("apk");
    private static final Path lucenePath = PATH.resolve(Paths.get("db", "lucene"));
    @Getter
    private static final LocalDate silkBarcodeInitLD = LocalDate.parse(CONFIG.getString("silkBarcodeInitLD"));

    private MesAutoConfig() {
    }

    public static JsonObject mongoOptions() {
        return CONFIG.getJsonObject("mongo");
    }

    public static JsonObject redisOptions() {
        return CONFIG.getJsonObject("redis");
    }

    public static JWTAuthOptions jwtAuthOptions() {
        final PubSecKeyOptions pubSecKey = new PubSecKeyOptions(CONFIG.getJsonObject("jwt"));
        return new JWTAuthOptions().addPubSecKey(pubSecKey);
    }

    public static JsonObject pdaConfig() {
        return CONFIG.getJsonObject("pda");
    }

    public static JsonObject openConfig() {
        return CONFIG.getJsonObject("open");
    }

    public static CorsConfig corsConfig() {
        final JsonObject jsonObject = CONFIG.getJsonObject("cors");
        return new CorsConfig(jsonObject);
    }

    public static JsonObject apkInfo() {
        final Path path = Paths.get("latest", "info.yml");
        return Util.readJsonObject(apkPath.resolve(path));
    }

    public static String apkFile(String version) {
        if ("latest".equalsIgnoreCase(version)) {
            final JsonObject apkInfo = apkInfo();
            version = apkInfo.getString("version");
        }
        return apkPath.resolve(Paths.get(version, "mes-auto.apk")).toFile().getPath();
    }

    public static Path luceneIndexPath(Class<?> clazz) {
        return lucenePath.resolve(clazz.getSimpleName());
    }

    public static Path luceneTaxoPath(Class<?> clazz) {
        return lucenePath.resolve(clazz.getSimpleName() + "_Taxonomy");
    }

    public static KeyStore getKeyStore() throws KeyStoreException, IOException, CertificateException, NoSuchAlgorithmException {
        final KeyStore keystore = KeyStore.getInstance("jceks");
        final File file = PATH.resolve("mes.jceks").toFile();
        final FileInputStream fis = new FileInputStream(file);
        keystore.load(fis, "esb-open-tomking".toCharArray());
        return keystore;
    }

    public static RabbitMQOptions rabbitMQOptions() {
        final JsonObject options = CONFIG.getJsonObject("rabbit");
        return new RabbitMQOptions(options);
    }

    public static JDBCClient jikonDS(Vertx vertx) {
        final JsonObject options = CONFIG.getJsonObject("jikon_ds");
        return JDBCClient.createShared(vertx, options, "jikonDS");
    }

}
