package com.hengyi.japp.mes.auto.search.application.internal;

import com.github.ixtf.persistence.lucene.BaseLucene;
import com.github.ixtf.persistence.lucene.Jlucene;
import com.github.ixtf.persistence.lucene.LuceneCommand;
import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.search.SearchModule;
import com.hengyi.japp.mes.auto.search.application.LuceneService;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.Map;

/**
 * @author jzb 2019-10-25
 */
@Slf4j
@Singleton
public class LuceneServiceImpl implements LuceneService {
    private final Map<String, BaseLucene> luceneMap;
    private final Jmongo jmongo;

    @Inject
    private LuceneServiceImpl(Jmongo jmongo) {
        this.jmongo = jmongo;
        luceneMap = Jlucene.collectBaseLucene(this.getClass().getPackageName(), SearchModule::getInstance);
    }

    @Override
    public void index(LuceneCommand command) {
        final BaseLucene lucene = luceneMap.get(command.getClassName());
        jmongo.find(command.getClazz(), command.getId()).subscribe(lucene::index);
    }

    @Override
    public void remove(LuceneCommand command) {
        final BaseLucene lucene = luceneMap.get(command.getClassName());
        lucene.remove(command.getId());
    }

    @Override
    public void close() throws IOException {
        luceneMap.values().forEach(BaseLucene::close);
    }
}
