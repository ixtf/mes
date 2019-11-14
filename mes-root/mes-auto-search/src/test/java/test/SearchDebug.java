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
import org.apache.commons.lang3.tuple.Pair;

import java.util.Collection;

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
        final Pair<Long, Collection<String>> pair = packageBoxLucene.query(packageBoxQuery);
        System.out.println(pair);
    }
}
