package com.hengyi.japp.mes.auto.agent.verticle;

import com.github.ixtf.vertx.Jvertx;
import com.github.ixtf.vertx.route.RoutingContextEnvelope;
import com.hengyi.japp.mes.auto.config.MesAutoConfig;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.http.HttpServerOptions;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.JWTAuthHandler;
import lombok.extern.slf4j.Slf4j;

import static com.hengyi.japp.mes.auto.config.MesAutoConfig.apkFile;
import static com.hengyi.japp.mes.auto.config.MesAutoConfig.apkInfo;
import static io.vertx.core.http.HttpMethod.POST;
import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * @author jzb 2018-06-20
 */
@Slf4j
public class PdaVerticle extends AbstractVerticle {


    @Override
    public void start() throws Exception {
        final Router router = Jvertx.router(vertx, MesAutoConfig.corsConfig());

        router.get("/apkInfo").produces(APPLICATION_JSON).handler(rc -> rc.response().end(apkInfo().encode()));
        router.get("/apk").handler(rc -> rc.reroute("/apk/latest"));
        router.get("/apk/:version").handler(rc -> {
            final String version = rc.pathParam("version");
            rc.response().sendFile(apkFile(version));
        });

        final JWTAuth jwtAuth = JWTAuth.create(vertx, MesAutoConfig.jwtAuthOptions());
        router.route("/api/*").handler(JWTAuthHandler.create(jwtAuth));

        router.route(POST, "/token").produces(APPLICATION_JSON).handler(rc -> {
            final JsonObject message = RoutingContextEnvelope.encode(rc);
            vertx.eventBus().send("agent:POST:/token", message);
        });

        final HttpServerOptions httpServerOptions = new HttpServerOptions()
                .setDecompressionSupported(true)
                .setCompressionSupported(true);
        vertx.createHttpServer(httpServerOptions)
                .requestHandler(router)
                .listen(MesAutoConfig.pdaConfig().getInteger("port", 9998));
    }

}
