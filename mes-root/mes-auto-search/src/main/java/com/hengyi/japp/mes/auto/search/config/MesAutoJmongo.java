package com.hengyi.japp.mes.auto.search.config;

import com.github.ixtf.persistence.mongo.JmongoOptions;
import com.hengyi.japp.mes.auto.search.SearchModule;
import com.mongodb.reactivestreams.client.MongoClient;

/**
 * @author jzb 2019-10-24
 */
public class MesAutoJmongo extends JmongoOptions {
    @Override
    protected MongoClient client() {
        return SearchModule.getInstance(MongoClient.class);
    }

    @Override
    public String dbName() {
        return "mes-auto";
    }

}
