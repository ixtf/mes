package test;

import com.github.ixtf.persistence.mongo.JmongoOptions;
import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.reactivestreams.client.MongoClient;
import com.mongodb.reactivestreams.client.MongoClients;

/**
 * @author jzb 2019-06-24
 */
public class JmongoDev extends JmongoOptions {
    @Override
    protected MongoClient client() {
        return MongoClients.create(
                MongoClientSettings.builder()
                        .applyConnectionString(new ConnectionString("mongodb://root:tomking@192.168.0.38"))
                        .build()
        );
    }

    @Override
    public String dbName() {
        return "mes-auto";
    }
}
