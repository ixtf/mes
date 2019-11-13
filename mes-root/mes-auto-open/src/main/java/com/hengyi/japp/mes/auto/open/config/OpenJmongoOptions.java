package com.hengyi.japp.mes.auto.open.config;

import com.github.ixtf.persistence.mongo.JmongoOptions;
import com.hengyi.japp.mes.auto.open.OpenModule;
import com.mongodb.reactivestreams.client.MongoClient;

/**
 * @author jzb 2019-10-24
 */
public class OpenJmongoOptions extends JmongoOptions {
    @Override
    protected MongoClient client() {
        return OpenModule.getInstance(MongoClient.class);
    }

    @Override
    public String dbName() {
        return "mes-auto";
    }
}
