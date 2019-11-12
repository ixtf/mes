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
    private static final ConsumeOptions consumeOptions = new ConsumeOptions().exceptionHandler(
            new ExceptionHandlers.RetryAcknowledgmentExceptionHandler(
                    Duration.ofDays(1), Duration.ofSeconds(5),
                    ExceptionHandlers.CONNECTION_RECOVERY_PREDICATE
            )
    );

    @Override
    public void start() throws Exception {
        final Receiver receiver = SearchModule.getInstance(Receiver.class);
        final LuceneService luceneService = SearchModule.getInstance(LuceneService.class);
        receiver.consumeManualAck(INDEX_QUEUE, consumeOptions).subscribe(luceneService::index);
        receiver.consumeManualAck(REMOVE_QUEUE, consumeOptions).subscribe(luceneService::remove);
    }

}
