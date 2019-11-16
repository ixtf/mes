package com.hengyi.japp.mes.auto.search.application.internal;

import com.github.ixtf.persistence.IEntity;
import com.github.ixtf.persistence.lucene.LuceneCommandOne;
import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.search.SearchModule;
import com.hengyi.japp.mes.auto.search.application.LuceneService;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.Map;
import java.util.function.Function;

import static com.github.ixtf.persistence.lucene.Jlucene.streamBaseLucene;
import static java.util.stream.Collectors.toUnmodifiableMap;

/**
 * @author jzb 2019-10-25
 */
@Slf4j
@Singleton
public class LuceneServiceImpl implements LuceneService {
    private final Map<Class, BaseLucene> luceneMap;
    private final Jmongo jmongo;

    @Inject
    private LuceneServiceImpl(Jmongo jmongo) {
        luceneMap = streamBaseLucene(this.getClass().getPackageName())
                .map(SearchModule::getInstance)
                .map(BaseLucene.class::cast)
                .collect(toUnmodifiableMap(it -> it.getEntityClass(), Function.identity()));
        System.out.println(luceneMap);
        this.jmongo = jmongo;
    }

    @Override
    public <T extends BaseLucene> T get(Class<? extends IEntity> entityClass) {
        return (T) luceneMap.get(entityClass);
    }

    @Override
    public Mono<Void> index(LuceneCommandOne command) {
        return jmongo.find(command.getClazz(), command.getId())
                .doOnNext(get(command.getClazz())::index).then()
                .retry(3)
                .doOnError(err -> log.error(command.getClassName() + "[" + command.getId() + "]", err));
    }

    @Override
    public Mono<Void> remove(LuceneCommandOne command) {
        return Mono.fromRunnable(() -> get(command.getClazz()).remove(command.getId())).then()
                .retry(3)
                .doOnError(err -> log.error(command.getClassName() + "[" + command.getId() + "]", err));
    }

    @Override
    public void close() throws IOException {
        luceneMap.values().forEach(BaseLucene::close);
    }
}
