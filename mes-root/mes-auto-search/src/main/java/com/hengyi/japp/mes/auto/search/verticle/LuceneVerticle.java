package com.hengyi.japp.mes.auto.search.verticle;

import com.hengyi.japp.mes.auto.search.SearchModule;
import com.hengyi.japp.mes.auto.search.application.LuceneService;
import io.vertx.core.AbstractVerticle;
import reactor.core.publisher.Mono;
import reactor.rabbitmq.ConsumeOptions;
import reactor.rabbitmq.Receiver;

/**
 * @author jzb 2018-12-13
 */
public class LuceneVerticle extends AbstractVerticle {
    public static final String INDEX_QUEUE = "mes:auto:lucene:index";
    public static final String REMOVE_QUEUE = "mes:auto:lucene:remove";
    private final Receiver receiver = SearchModule.getInstance(Receiver.class);
    private final LuceneService luceneService = SearchModule.getInstance(LuceneService.class);

    @Override
    public void start() throws Exception {
        receiver.consumeManualAck(INDEX_QUEUE, SearchModule.getInstance(ConsumeOptions.class))
                .concatMap(luceneService::index)
                .onErrorResume(err -> Mono.empty())
                .subscribe();
        receiver.consumeManualAck(REMOVE_QUEUE, SearchModule.getInstance(ConsumeOptions.class))
                .concatMap(luceneService::remove)
                .onErrorResume(err -> Mono.empty())
                .subscribe();
    }

    @Override
    public void stop() throws Exception {
        receiver.close();
        luceneService.close();
    }
}
