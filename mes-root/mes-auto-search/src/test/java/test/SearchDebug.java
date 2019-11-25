package test;

import com.github.ixtf.persistence.lucene.LuceneCommandOne;
import com.github.ixtf.persistence.mongo.Jmongo;
import com.hengyi.japp.mes.auto.domain.PackageBox;
import com.hengyi.japp.mes.auto.search.MainVerticle;
import com.hengyi.japp.mes.auto.search.SearchModule;
import com.hengyi.japp.mes.auto.search.application.LuceneService;
import com.hengyi.japp.mes.auto.search.application.internal.PackageBoxLucene;
import io.vertx.core.AsyncResult;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import lombok.SneakyThrows;

/**
 * @author jzb 2019-11-12
 */
public class SearchDebug {

    public static void main(String[] args) {
        Vertx.vertx().deployVerticle(MainVerticle.class, new DeploymentOptions(), SearchDebug::test);
    }

    @SneakyThrows
    private static void test(AsyncResult<String> asyncResult) {
        final LuceneService luceneService = SearchModule.getInstance(LuceneService.class);
        final Jmongo jmongo = SearchModule.getInstance(Jmongo.class);
        final PackageBoxLucene packageBoxLucene = SearchModule.getInstance(PackageBoxLucene.class);
        final LuceneCommandOne commandOne = new LuceneCommandOne();
        commandOne.setClassName(PackageBox.class.getName());
        commandOne.setId("5c2e180412f79200019c7712");
        final PackageBox packageBox = jmongo.find(PackageBox.class, "5c2e180412f79200019c7712").block();
        packageBoxLucene.index(packageBox);
        luceneService.index(commandOne);
//        baseLucene.indexAll();


//        System.out.println(PackageBox.class.getName());
//        final PackageBoxLucene packageBoxLucene = SearchModule.getInstance(PackageBoxLucene.class);
//        final PackageBoxQuery packageBoxQuery = new PackageBoxQuery();
//        packageBoxQuery.setFirst(0);
//        packageBoxQuery.setPageSize(50);
////        final Pair<Long, Collection<String>> pair = packageBoxLucene.query(packageBoxQuery);
////        System.out.println(pair);
//
//        final HttpClient httpClient = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();
//        final HttpRequest httpRequest = HttpRequest.newBuilder()
//                .uri(URI.create("http://localhost:9999/search/packageBoxes"))
//                .POST(BodyPublishers.ofByteArray(MAPPER.writeValueAsBytes(packageBoxQuery)))
//                .build();
//        final HttpResponse<byte[]> response = httpClient.send(httpRequest, BodyHandlers.ofByteArray());
//        System.out.println(response.statusCode());
//        final QueryResult queryResult = MAPPER.readValue(response.body(), QueryResult.class);
//        System.out.println(queryResult);
    }
}
