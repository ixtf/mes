package com.hengyi.japp.mes.auto.agent.verticle;

import com.github.ixtf.vertx.Jvertx;
import com.hengyi.japp.mes.auto.config.MesAutoConfig;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.http.HttpServerOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.bridge.BridgeEventType;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.JWTAuthHandler;
import io.vertx.ext.web.handler.sockjs.BridgeOptions;
import io.vertx.ext.web.handler.sockjs.PermittedOptions;
import io.vertx.ext.web.handler.sockjs.SockJSHandler;
import io.vertx.ext.web.handler.sockjs.SockJSHandlerOptions;
import lombok.extern.slf4j.Slf4j;

/**
 * @author jzb 2018-06-20
 */
@Slf4j
public class OpenVerticle extends AbstractVerticle {

    @Override
    public void start() throws Exception {
        final Router router = Jvertx.router(vertx, MesAutoConfig.corsConfig());
        router.mountSubRouter("/eventbus/*", eventBusRouter());

        final JWTAuth jwtAuth = JWTAuth.create(vertx, MesAutoConfig.jwtAuthOptions());
        router.route("/riamb/*").handler(JWTAuthHandler.create(jwtAuth));

        final HttpServerOptions httpServerOptions = new HttpServerOptions()
                .setDecompressionSupported(true)
                .setCompressionSupported(true);
        vertx.createHttpServer(httpServerOptions)
                .requestHandler(router)
                .listen(MesAutoConfig.openConfig().getInteger("port", 9999));
    }

    // todo websocket 权限
    private Router eventBusRouter() {
        final SockJSHandlerOptions options = new SockJSHandlerOptions().setHeartbeatInterval(300000);
        final BridgeOptions bo = new BridgeOptions()
                .addOutboundPermitted(new PermittedOptions().setAddress("sockjs.global"))
                .addOutboundPermitted(new PermittedOptions().setAddressRegex("^mes-auto://websocket/boards/.+"));

        return SockJSHandler.create(vertx, options).bridge(bo, be -> {
            if (BridgeEventType.REGISTER == be.type()) {
                System.out.println("rawMessage:" + be.getRawMessage().encode());
            }
            be.complete(true);
        });
    }
}
