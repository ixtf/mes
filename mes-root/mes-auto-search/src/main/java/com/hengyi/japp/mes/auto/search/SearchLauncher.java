package com.hengyi.japp.mes.auto.search;

import io.vertx.core.Launcher;
import io.vertx.core.Vertx;
import io.vertx.core.VertxOptions;
import io.vertx.micrometer.MicrometerMetricsOptions;
import io.vertx.micrometer.VertxPrometheusOptions;

import java.util.concurrent.TimeUnit;

/**
 * @author jzb 2018-12-13
 */
public class SearchLauncher extends Launcher {

    public static void main(String[] args) {
        new SearchLauncher().dispatch(args);
    }

    @Override
    public void beforeStartingVertx(VertxOptions options) {
        final VertxPrometheusOptions prometheusOptions = new VertxPrometheusOptions()
                .setEnabled(true);
        final MicrometerMetricsOptions metricsOptions = new MicrometerMetricsOptions()
                .setPrometheusOptions(prometheusOptions)
                .setEnabled(true);
        options.setMetricsOptions(metricsOptions)
                .setWorkerPoolSize(1000)
                .setMaxEventLoopExecuteTime(10)
                .setMaxEventLoopExecuteTimeUnit(TimeUnit.SECONDS);
    }

    @Override
    public void afterStartingVertx(Vertx vertx) {
        SearchModule.init(vertx);
    }

}
