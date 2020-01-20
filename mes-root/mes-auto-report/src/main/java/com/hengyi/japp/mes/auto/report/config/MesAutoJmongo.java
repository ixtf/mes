package com.hengyi.japp.mes.auto.report.config;

import com.github.ixtf.persistence.mongo.JmongoOptions;
import com.mongodb.reactivestreams.client.MongoClient;

import static com.hengyi.japp.mes.auto.GuiceModule.getInstance;

/**
 * @author jzb 2019-10-24
 */
public class MesAutoJmongo extends JmongoOptions {
    @Override
    protected MongoClient client() {
        return getInstance(MongoClient.class);
    }

    @Override
    public String dbName() {
        return "mes-auto";
    }

}
