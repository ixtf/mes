package com.hengyi.japp.mes.auto.search.verticle;

import com.hengyi.japp.mes.auto.search.SearchModule;
import com.hengyi.japp.mes.auto.search.application.LuceneService;
import io.vertx.core.AbstractVerticle;
import reactor.rabbitmq.ConsumeOptions;
import reactor.rabbitmq.ExceptionHandlers;
import reactor.rabbitmq.Receiver;

import java.time.Duration;

/**
 * @author jzb 2018-12-13
 */
public class LuceneVerticle extends AbstractVerticle {
    public static final String INDEX_QUEUE = "mes:auto:lucene:index";
    public static final String REMOVE_QUEUE = "mes:auto:lucene:remove";
    public static final String ERROR_QUEUE = "mes:auto:lucene:error";
    private static final ConsumeOptions consumeOptions = new ConsumeOptions().exceptionHandler(
            new ExceptionHandlers.RetryAcknowledgmentExceptionHandler(
                    Duration.ofDays(1), Duration.ofSeconds(5),
                    ExceptionHandlers.CONNECTION_RECOVERY_PREDICATE
            )
    );
    private final Receiver receiver = SearchModule.getInstance(Receiver.class);
    private final LuceneService luceneService = SearchModule.getInstance(LuceneService.class);

    @Override
    public void start() throws Exception {
//        receiver.consumeManualAck(INDEX_QUEUE, consumeOptions)
//                .concatMap(luceneService::index)
//                .subscribe();
//        receiver.consumeManualAck(REMOVE_QUEUE, consumeOptions)
//                .concatMap(luceneService::remove)
//                .subscribe();
    }

    @Override
    public void stop() throws Exception {
        receiver.close();
        luceneService.close();
    }
}
