package test;

import com.hengyi.japp.mes.auto.domain.PackageBox;
import com.hengyi.japp.mes.auto.query.PackageBoxQuery;
import com.hengyi.japp.mes.auto.search.MainVerticle;
import com.hengyi.japp.mes.auto.search.SearchModule;
import com.hengyi.japp.mes.auto.search.application.internal.PackageBoxLucene;
import io.vertx.core.AsyncResult;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import lombok.SneakyThrows;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2019-11-12
 */
public class SearchDebug {

    public static void main(String[] args) {
        Vertx.vertx().deployVerticle(MainVerticle::new, new DeploymentOptions(), SearchDebug::test);
    }

    @SneakyThrows
    private static void test(AsyncResult<String> asyncResult) {
        System.out.println(PackageBox.class.getName());
        final PackageBoxLucene packageBoxLucene = SearchModule.getInstance(PackageBoxLucene.class);
        final PackageBoxQuery packageBoxQuery = new PackageBoxQuery();
        packageBoxQuery.setFirst(0);
        packageBoxQuery.setPageSize(50);
//        final Pair<Long, Collection<String>> pair = packageBoxLucene.query(packageBoxQuery);
//        System.out.println(pair);

        final HttpClient httpClient = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();
        final HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:8080/search/packageBoxes"))
                .POST(BodyPublishers.ofByteArray(MAPPER.writeValueAsBytes(packageBoxQuery)))
                .build();
        final HttpResponse<byte[]> response = httpClient.send(httpRequest, BodyHandlers.ofByteArray());
        System.out.println(response.statusCode());
        final QueryResult queryResult = MAPPER.readValue(response.body(), QueryResult.class);
        System.out.println(queryResult);
    }
}
