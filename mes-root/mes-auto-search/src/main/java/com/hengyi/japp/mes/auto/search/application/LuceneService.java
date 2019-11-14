package com.hengyi.japp.mes.auto.search.application;

import com.github.ixtf.persistence.IEntity;
import com.github.ixtf.persistence.lucene.LuceneCommandOne;
import com.google.inject.ImplementedBy;
import com.hengyi.japp.mes.auto.search.application.internal.BaseLucene;
import com.hengyi.japp.mes.auto.search.application.internal.LuceneServiceImpl;
import com.rabbitmq.client.Delivery;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.rabbitmq.AcknowledgableDelivery;

import java.io.Closeable;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2019-10-25
 */
@ImplementedBy(LuceneServiceImpl.class)
public interface LuceneService extends Closeable {

    <T extends BaseLucene> T get(Class<? extends IEntity> entityClass);

    default Mono<LuceneCommandOne> rxCommand(Delivery delivery) {
        return Mono.fromCallable(() -> MAPPER.readValue(delivery.getBody(), LuceneCommandOne.class))
                .subscribeOn(Schedulers.elastic());
    }

    default Mono<Void> index(AcknowledgableDelivery delivery) {
        return rxCommand(delivery).flatMap(this::index)
                .doOnError(err -> delivery.nack(false))
                .doOnSuccess(it -> delivery.ack());
    }

    default Mono<Void> remove(AcknowledgableDelivery delivery) {
        return rxCommand(delivery).flatMap(this::remove)
                .doOnError(err -> delivery.nack(false))
                .doOnSuccess(it -> delivery.ack());
    }

    Mono<Void> index(LuceneCommandOne command);

    Mono<Void> remove(LuceneCommandOne command);
}
