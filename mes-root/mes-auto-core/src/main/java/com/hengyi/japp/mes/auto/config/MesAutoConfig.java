package com.hengyi.japp.mes.auto.config;

import com.github.ixtf.vertx.CorsConfig;
import com.hengyi.japp.mes.auto.Util;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.PubSecKeyOptions;
import io.vertx.ext.auth.jwt.JWTAuthOptions;
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
import java.util.Arrays;
import java.util.Set;

import static java.util.stream.Collectors.toSet;

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
        final JsonObject cors = CONFIG.getJsonObject("cors");
        final Object value = cors.getValue("domainPatterns");
        final Object[] objects = (Object[]) value;
        final Set<String> domainPatterns = Arrays.stream(objects).map(it -> (String) it).collect(toSet());
        final CorsConfig corsConfig = new CorsConfig();
        corsConfig.setDomainPatterns(domainPatterns);
        return corsConfig;
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

    public static KeyStore getKeyStore() throws KeyStoreException, IOException, CertificateException, NoSuchAlgorithmException {
        final KeyStore keystore = KeyStore.getInstance("jceks");
        final File file = PATH.resolve("mes.jceks").toFile();
        final FileInputStream fis = new FileInputStream(file);
        keystore.load(fis, "esb-open-tomking".toCharArray());
        return keystore;
    }

}
