package com.hengyi.japp.mes.auto.search.application.internal;

import com.github.ixtf.persistence.IEntity;
import com.github.ixtf.persistence.lucene.LuceneCommandOne;
import com.github.ixtf.persistence.mongo.Jmongo;
import com.hengyi.japp.mes.auto.search.SearchModule;
import com.mongodb.client.model.changestream.ChangeStreamDocument;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.rabbitmq.ExceptionHandlers;
import reactor.rabbitmq.OutboundMessage;
import reactor.rabbitmq.SendOptions;
import reactor.rabbitmq.Sender;

import javax.inject.Named;
import java.nio.file.Path;
import java.time.Duration;

import static com.github.ixtf.japp.core.Constant.MAPPER;
import static com.github.ixtf.persistence.mongo.Jmongo.ID_COL;
import static com.hengyi.japp.mes.auto.search.verticle.LuceneVerticle.INDEX_QUEUE;

/**
 * @author jzb 2019-11-13
 */
@Slf4j
@SuppressWarnings("CdiManagedBeanInconsistencyInspection")
public abstract class BaseLucene<T extends IEntity> extends com.github.ixtf.persistence.lucene.BaseLucene<T> {
    private static final SendOptions sendOptions = new SendOptions().exceptionHandler(
            new ExceptionHandlers.RetrySendingExceptionHandler(
                    Duration.ofHours(1), Duration.ofMinutes(5),
                    ExceptionHandlers.CONNECTION_RECOVERY_PREDICATE
            )
    );
    protected final Jmongo jmongo;
    private boolean indexAlling;

    protected BaseLucene(@Named("luceneRootPath") Path luceneRootPath, Jmongo jmongo) {
        super(luceneRootPath);
        this.jmongo = jmongo;
//        watch();
    }

    private void watch() {
        Flux.from(jmongo.collection(entityClass).watch())
                .concatMap(this::watchIndex)
                .subscribe();
    }

    private Mono<Void> watchIndex(ChangeStreamDocument<Document> documentChangeStreamDocument) {
        final Sender sender = SearchModule.getInstance(Sender.class);
        final Mono<OutboundMessage> message$ = Mono.just(documentChangeStreamDocument)
                .map(ChangeStreamDocument::getFullDocument)
                .flatMap(it -> {
                    final LuceneCommandOne command = new LuceneCommandOne();
                    command.setClassName(entityClass.getName());
                    command.setId(it.getString(ID_COL));
                    return Mono.fromCallable(() -> MAPPER.writeValueAsBytes(command));
                })
                .map(body -> new OutboundMessage("", INDEX_QUEUE, body));
//        return sender.send(message$, sendOptions).onErrorResume(err -> {
//            documentChangeStreamDocument.getDocumentKey();
//            log.error("watchIndex:" + entityClass + "[" + "]", err);
//            return Mono.empty();
//        }).then();
        System.out.println(documentChangeStreamDocument.getFullDocument());
        return Mono.empty();
    }

    synchronized public String indexAll() {
        if (indexAlling) {
            return "indexAlling=正在全局索引";
        }
        indexAlling = true;
        jmongo.find(entityClass).doOnNext(this::index)
                .onErrorResume(err -> {
                    log.error("", err);
                    return Mono.empty();
                })
                .doOnComplete(() -> indexAlling = false)
                .subscribe();
        return "indexAlling=ok";
    }
}
