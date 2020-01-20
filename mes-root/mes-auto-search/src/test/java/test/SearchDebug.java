package test;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.hengyi.japp.mes.auto.domain.SilkBarcode;
import com.hengyi.japp.mes.auto.search.SearchModule;
import com.hengyi.japp.mes.auto.search.application.LuceneService;
import com.hengyi.japp.mes.auto.search.application.internal.PackageBoxLucene;
import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.reactivestreams.client.MongoClient;
import com.mongodb.reactivestreams.client.MongoClients;
import com.mongodb.reactivestreams.client.MongoCollection;
import com.mongodb.reactivestreams.client.MongoDatabase;
import io.vertx.core.AsyncResult;
import lombok.SneakyThrows;
import org.bson.Document;
import reactor.core.publisher.Flux;

import java.util.List;

/**
 * @author jzb 2019-11-12
 */
public class SearchDebug {

    public static void main(String[] args) {
        final String connection_string = "mongodb://mes-auto-search:mes-auto-search%40com.hengyi.japp@10.2.0.212/?maxidletimems=6000";
        final MongoClientSettings.Builder builder = MongoClientSettings.builder()
                .applyConnectionString(new ConnectionString(connection_string));
        final MongoClient mongoClient = MongoClients.create(builder.build());
        final MongoDatabase database = mongoClient.getDatabase("mes-auto");
        final MongoCollection<Document> t_workshop = database.getCollection("T_Workshop");
        final List<Document> block = Flux.from(t_workshop.find()).collectList().block();
        System.out.println(block);

//        Vertx.vertx().deployVerticle(MainVerticle.class, new DeploymentOptions(), SearchDebug::test);
    }

    @SneakyThrows
    private static void test(AsyncResult<String> asyncResult) {
        final LuceneService luceneService = SearchModule.getInstance(LuceneService.class);
        final Jmongo jmongo = SearchModule.getInstance(Jmongo.class);
        final SilkBarcode silkBarcode = jmongo.find(SilkBarcode.class, "5de318e55dbc8d00010a3d89").block();
        System.out.println(silkBarcode);
        final PackageBoxLucene packageBoxLucene = SearchModule.getInstance(PackageBoxLucene.class);
    }
}
