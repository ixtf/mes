package com.hengyi.japp.mes.auto.agent.verticle;

import com.github.ixtf.vertx.Jvertx;
import com.github.ixtf.vertx.RCEnvelope;
import com.hengyi.japp.mes.auto.config.MesAutoConfig;
import io.reactivex.Completable;
import io.reactivex.functions.Consumer;
import io.vertx.core.http.HttpServerOptions;
import io.vertx.reactivex.core.AbstractVerticle;
import io.vertx.reactivex.core.eventbus.Message;
import io.vertx.reactivex.ext.auth.jwt.JWTAuth;
import io.vertx.reactivex.ext.web.Route;
import io.vertx.reactivex.ext.web.Router;
import io.vertx.reactivex.ext.web.RoutingContext;
import io.vertx.reactivex.ext.web.handler.JWTAuthHandler;
import lombok.extern.slf4j.Slf4j;

import static com.hengyi.japp.mes.auto.config.MesAutoConfig.*;
import static io.vertx.core.http.HttpMethod.POST;
import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * @author jzb 2018-06-20
 */
@Slf4j
public class PdaVerticle extends AbstractVerticle {

    @Override
    public Completable rxStart() {
        final Router router = Router.router(vertx);
        Jvertx.enableCommon(router);
        Jvertx.enableCors(router, corsConfig().getDomainPatterns());
        router.route().failureHandler(Jvertx::failureHandler);

        router.get("/apkInfo").produces(APPLICATION_JSON).handler(rc -> rc.response().end(apkInfo().encode()));
        router.get("/apk").handler(rc -> rc.reroute("/apk/latest"));
        router.get("/apk/:version").handler(rc -> {
            final String version = rc.pathParam("version");
            rc.response().sendFile(apkFile(version));
        });

        final JWTAuth jwtAuth = JWTAuth.create(vertx, MesAutoConfig.jwtAuthOptions());
        router.route("/api/*").handler(JWTAuthHandler.create(jwtAuth));

        router.route(POST, "/token").produces(APPLICATION_JSON).handler(rc -> {
            RCEnvelope.send(rc, "agent:POST:/token");
        });

//        router.route(GET, "/api/auth").produces(APPLICATION_JSON).handler(rc -> Single.just(rc).map(this::getMessage)
//                .flatMap(it -> vertx.eventBus().rxSend("agent:GET:/api/auth", it))
//                .doOnError(rc::fail)
//                .subscribe(subscribeFun(rc)));

        Jvertx.routes().forEach(routeRepresentation -> {
            final Route route = router.route(routeRepresentation.getHttpMethod(), routeRepresentation.getPath());
            routeRepresentation.consumes().forEach(route::consumes);
            routeRepresentation.produces().forEach(route::produces);
            route.handler(routeRepresentation.getRoutingContextHandler());
        });

        final HttpServerOptions httpServerOptions = new HttpServerOptions()
                .setDecompressionSupported(true)
                .setCompressionSupported(true);
        return vertx.createHttpServer(httpServerOptions)
                .requestHandler(router)
                .rxListen(MesAutoConfig.pdaConfig().getInteger("port", 9998))
                .ignoreElement();
    }

    private Consumer<Message<Object>> subscribeFun(RoutingContext rc) {
        return null;
    }

}
