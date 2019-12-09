package test;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.hengyi.japp.mes.auto.domain.SilkBarcode;
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
        final SilkBarcode silkBarcode = jmongo.find(SilkBarcode.class, "5de318e55dbc8d00010a3d89").block();
        System.out.println(silkBarcode);
        final PackageBoxLucene packageBoxLucene = SearchModule.getInstance(PackageBoxLucene.class);
    }
}
