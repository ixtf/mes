package test;

import com.hengyi.japp.mes.auto.report.ReportVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import io.vertx.core.VertxOptions;

/**
 * @author jzb 2020-01-20
 */
public class ReportDebug {
    public static void main(String[] args) {
        Vertx.clusteredVertx(new VertxOptions(), ar -> {
            if (ar.succeeded()) {
                final Vertx vertx = ar.result();
                vertx.deployVerticle(ReportVerticle.class, new DeploymentOptions());
            } else {
                ar.cause().printStackTrace();
            }
        });
    }
}
