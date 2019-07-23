package com.hengyi.japp.mes.auto.report;

import com.github.ixtf.japp.vertx.Jvertx;
import com.hengyi.japp.mes.auto.config.MesAutoConfig;
import io.reactivex.Completable;
import io.vertx.core.eventbus.DeliveryOptions;
import io.vertx.reactivex.core.AbstractVerticle;
import io.vertx.reactivex.ext.web.Router;
import io.vertx.reactivex.ext.web.RoutingContext;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;

import static com.hengyi.japp.mes.auto.report.Report.INJECTOR;
import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * @author jzb 2018-06-20
 */
@Slf4j
public class ReportAgentVerticle extends AbstractVerticle {
    final MesAutoConfig config = INJECTOR.getInstance(MesAutoConfig.class);

    @Override
    public Completable rxStart() {
        Router router = Router.router(vertx);
        Jvertx.enableCommon(router);
        Jvertx.enableCors(router, config.getCorsConfig().getDomainPatterns());
        router.route().failureHandler(Jvertx::failureHandler);
//        router.route().handler(BodyHandler.create());
//        router.route().handler(ResponseContentTypeHandler.create());

        router.post("/statisticReport/generate").produces(APPLICATION_JSON)
                .handler(rc -> common(rc, "mes-auto:report:statisticReport:generate", setMinutes(5)));
        router.post("/statisticReport/fromDisk").produces(APPLICATION_JSON)
                .handler(rc -> common(rc, "mes-auto:report:statisticReport:fromDisk"));
        router.post("/statisticReport/rangeDisk").produces(APPLICATION_JSON)
                .handler(rc -> common(rc, "mes-auto:report:statisticReport:rangeDisk"));

        router.post("/dyeingReport").produces(APPLICATION_JSON)
                .handler(rc -> common(rc, "mes-auto:report:dyeingReport", setMinutes(5)));
        router.post("/strippingReport").produces(APPLICATION_JSON)
                .handler(rc -> common(rc, "mes-auto:report:strippingReport", setMinutes(10)));
        router.post("/measureFiberReport").produces(APPLICATION_JSON)
                .handler(rc -> common(rc, "mes-auto:report:measureFiberReport", setMinutes(5)));
        router.post("/silkExceptionReport").produces(APPLICATION_JSON)
                .handler(rc -> common(rc, "mes-auto:report:silkExceptionReport", setMinutes(3)));
        router.post("/packagePlanBoard").produces(APPLICATION_JSON)
                .handler(rc -> common(rc, "mes-auto:report:packagePlanBoard"));

        return vertx.createHttpServer().requestHandler(router).rxListen(9997).ignoreElement();
    }

    private DeliveryOptions setMinutes(long minutes) {
        return new DeliveryOptions().setSendTimeout(Duration.ofMinutes(minutes).toMillis());
    }

    private void common(RoutingContext rc, String address) {
        DeliveryOptions deliveryOptions = new DeliveryOptions().setSendTimeout(Duration.ofMinutes(1).toMillis());
        common(rc, address, deliveryOptions);
    }

    private void common(RoutingContext rc, String address, DeliveryOptions deliveryOptions) {
        vertx.eventBus().rxSend(address, rc.getBodyAsString(), deliveryOptions).subscribe(reply -> {
            String ret = (String) reply.body();
            rc.response().putHeader("Content-Type", "application/json; charset=utf-8").end(ret);
        }, err -> {
            log.error("", err);
            rc.fail(err);
        });
    }

}
