package test;

import com.github.ixtf.japp.core.J;
import com.hengyi.japp.mes.auto.report.MainVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import io.vertx.core.VertxOptions;

import java.util.Optional;

/**
 * @author jzb 2020-01-20
 */
public class ReportDebug {
    public static void main(String[] args) {
        final VertxOptions vertxOptions = new VertxOptions();
        Optional.ofNullable(System.getProperty("vertx.cluster.host")).filter(J::nonBlank)
                .ifPresent(vertxOptions.getEventBusOptions()::setHost);
        Vertx.clusteredVertx(vertxOptions, ar -> {
            if (ar.succeeded()) {
                final Vertx vertx = ar.result();
                vertx.deployVerticle(MainVerticle.class, new DeploymentOptions());
            } else {
                ar.cause().printStackTrace();
            }
        });
    }
}
