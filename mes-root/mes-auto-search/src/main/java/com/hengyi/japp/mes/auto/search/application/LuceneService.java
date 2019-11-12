package com.hengyi.japp.mes.auto.search.application;

import com.github.ixtf.persistence.lucene.LuceneCommand;
import com.google.inject.ImplementedBy;
import com.hengyi.japp.mes.auto.search.application.internal.LuceneServiceImpl;
import com.rabbitmq.client.Delivery;
import reactor.core.publisher.Mono;
import reactor.rabbitmq.AcknowledgableDelivery;

import java.io.Closeable;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2019-10-25
 */
@ImplementedBy(LuceneServiceImpl.class)
public interface LuceneService extends Closeable {

    default Mono<LuceneCommand> rxCommand(Delivery delivery) {
        return Mono.fromCallable(() -> MAPPER.readValue(delivery.getBody(), LuceneCommand.class));
    }

    default void index(AcknowledgableDelivery delivery) {
        rxCommand(delivery).doOnNext(this::index).then()
                .doOnError(err -> delivery.nack(true))
                .doOnSuccess(it -> delivery.ack())
                .subscribe();
    }

    default void remove(AcknowledgableDelivery delivery) {
        rxCommand(delivery).doOnNext(this::remove).then()
                .doOnError(err -> delivery.nack(true))
                .doOnSuccess(it -> delivery.ack())
                .subscribe();
    }

    void index(LuceneCommand command);

    void remove(LuceneCommand command);
}
