package com.hengyi.japp.mes.auto.report;

import com.github.ixtf.japp.core.J;
import io.vertx.core.Launcher;
import io.vertx.core.Vertx;
import io.vertx.core.VertxOptions;
import io.vertx.micrometer.MicrometerMetricsOptions;
import io.vertx.micrometer.VertxPrometheusOptions;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * @author jzb 2018-12-13
 */
public class ReportLauncher extends Launcher {

    public static void main(String[] args) {
        new ReportLauncher().dispatch(args);
    }

    @Override
    public void beforeStartingVertx(VertxOptions options) {
        final VertxPrometheusOptions prometheusOptions = new VertxPrometheusOptions()
                .setEnabled(true);
        final MicrometerMetricsOptions metricsOptions = new MicrometerMetricsOptions()
                .setPrometheusOptions(prometheusOptions)
                .setEnabled(true);
        Optional.ofNullable(System.getProperty("vertx.cluster.host")).filter(J::nonBlank)
                .ifPresent(options.getEventBusOptions()::setHost);
        options.setMetricsOptions(metricsOptions)
                .setWorkerPoolSize(1000)
                .setMaxEventLoopExecuteTime(10)
                .setMaxEventLoopExecuteTimeUnit(TimeUnit.SECONDS);
    }

    @Override
    public void afterStartingVertx(Vertx vertx) {
        ReportModule.init(vertx);
    }

}
