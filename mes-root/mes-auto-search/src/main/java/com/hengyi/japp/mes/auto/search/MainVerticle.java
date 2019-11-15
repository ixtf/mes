package com.hengyi.japp.mes.auto.search;

import com.hengyi.japp.mes.auto.search.verticle.AgentVerticle;
import com.hengyi.japp.mes.auto.search.verticle.LuceneVerticle;
import com.hengyi.japp.mes.auto.search.verticle.WorkerVerticle;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.CompositeFuture;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Future;

/**
 * @author jzb 2019-10-24
 */
public class MainVerticle extends AbstractVerticle {

    @Override
    public void start() throws Exception {
        SearchModule.init(vertx);
    }

    @Override
    public void start(Future<Void> startFuture) throws Exception {
        start();
        CompositeFuture.all(
                deployLuceneVerticle(),
                deployWorkVerticle()
        ).compose(it -> deployAgentVerticle()).<Void>mapEmpty().setHandler(startFuture);
    }

    private Future<String> deployLuceneVerticle() {
        return Future.future(p -> {
            final DeploymentOptions deploymentOptions = new DeploymentOptions()
                    .setWorker(true)
                    .setInstances(20);
            vertx.deployVerticle(LuceneVerticle.class, deploymentOptions, p);
        });
    }

    private Future<String> deployWorkVerticle() {
        return Future.future(p -> {
            final DeploymentOptions deploymentOptions = new DeploymentOptions()
                    .setWorker(true)
                    .setInstances(1000);
            vertx.deployVerticle(WorkerVerticle.class, deploymentOptions, p);
        });
    }

    private Future<String> deployAgentVerticle() {
        return Future.future(p -> {
            final DeploymentOptions deploymentOptions = new DeploymentOptions()
                    .setInstances(20);
            vertx.deployVerticle(AgentVerticle.class, deploymentOptions, p);
        });
    }
}
