package com.hengyi.japp.mes.auto.search.verticle;

import com.github.ixtf.vertx.Jvertx;
import com.hengyi.japp.mes.auto.search.SearchModule;
import com.hengyi.japp.mes.auto.search.verticle.AgentVerticle.AgentResolver;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;

import java.util.List;

import static java.util.stream.Collectors.toList;

/**
 * @author jzb 2019-10-24
 */
public class WorkerVerticle extends AbstractVerticle {

    @Override
    public void start(Future<Void> startFuture) throws Exception {
        start();
        final List<Future> futures = Jvertx.resolve(AgentResolver.class)
                .map(it -> it.consumer(vertx, SearchModule::getInstance))
                .collect(toList());
        CompositeFuture.all(futures).<Void>mapEmpty().setHandler(startFuture);
    }

}
