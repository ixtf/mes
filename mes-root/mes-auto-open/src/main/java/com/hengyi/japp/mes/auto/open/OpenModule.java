package com.hengyi.japp.mes.auto.open;

import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.GuiceModule;
import io.vertx.core.Vertx;

import javax.inject.Named;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 描述：
 *
 * @author jzb 2018-03-21
 */
public class OpenModule extends GuiceModule {

    synchronized public static void init(Vertx vertx) {
        if (INJECTOR == null) {
            VERTX = vertx;
            INJECTOR = com.google.inject.Guice.createInjector(new OpenModule());
        }
    }

    @Provides
    @Singleton
    @Named("rootPath")
    private Path rootPath() {
        return Paths.get(System.getProperty("mes.auto.open.path", "/home/mes/open"));
    }

}
