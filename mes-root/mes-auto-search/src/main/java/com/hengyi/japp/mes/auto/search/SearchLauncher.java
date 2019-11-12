package com.hengyi.japp.mes.auto.search;

import io.vertx.core.Launcher;
import io.vertx.core.VertxOptions;
import io.vertx.micrometer.MicrometerMetricsOptions;
import io.vertx.micrometer.VertxPrometheusOptions;

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
        options.setMetricsOptions(metricsOptions);
    }
}
