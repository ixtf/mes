package com.hengyi.japp.mes.auto.search.verticle;

import com.github.ixtf.vertx.CorsConfig;
import com.github.ixtf.vertx.Jvertx;
import com.hengyi.japp.mes.auto.search.SearchModule;
import com.hengyi.japp.mes.auto.search.interfaces.rest.RestResolver;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Future;
import io.vertx.core.http.HttpServer;
import io.vertx.core.http.HttpServerOptions;
import io.vertx.ext.healthchecks.HealthCheckHandler;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.ResponseContentTypeHandler;
import io.vertx.micrometer.PrometheusScrapingHandler;
import org.apache.commons.io.FileUtils;

/**
 * @author jzb 2019-10-24
 */
public class AgentVerticle extends AbstractVerticle {

    @Override
    public void start(Future<Void> startFuture) throws Exception {
        start();
        final Router router = Jvertx.router(vertx, CorsConfig.builder().build());
        router.route().handler(BodyHandler.create().setUploadsDirectory(FileUtils.getTempDirectoryPath()));
        router.route().handler(ResponseContentTypeHandler.create());
        router.route("/status").handler(HealthCheckHandler.create(vertx));
        router.route("/metrics").handler(PrometheusScrapingHandler.create());

        Jvertx.resolve(RestResolver.class).forEach(it -> it.router(router, SearchModule::getInstance));
        final HttpServerOptions httpServerOptions = new HttpServerOptions()
                .setDecompressionSupported(true)
                .setCompressionSupported(true)
                .setWebsocketSubProtocols("graphql-ws");
        Future.<HttpServer>future(promise -> vertx.createHttpServer(httpServerOptions)
                .requestHandler(router)
                .listen(8080, promise))
                .<Void>mapEmpty()
                .setHandler(startFuture);
    }

}
