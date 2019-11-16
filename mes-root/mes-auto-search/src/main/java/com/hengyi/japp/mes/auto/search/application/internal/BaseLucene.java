package com.hengyi.japp.mes.auto.search.application.internal;

import com.github.ixtf.persistence.IEntity;
import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.name.Named;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import java.nio.file.Path;

/**
 * @author jzb 2019-11-13
 */
@Slf4j
public abstract class BaseLucene<T extends IEntity> extends com.github.ixtf.persistence.lucene.BaseLucene<T> {
    protected final Jmongo jmongo;
    private boolean indexAlling;

    protected BaseLucene(@Named("lucenePath") Path lucenePath, Jmongo jmongo) {
        super(lucenePath);
        this.jmongo = jmongo;
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
