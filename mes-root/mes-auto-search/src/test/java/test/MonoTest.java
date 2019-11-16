package test;

import com.github.ixtf.persistence.lucene.LuceneCommandOne;
import com.hengyi.japp.mes.auto.query.PackageBoxQuery;
import com.hengyi.japp.mes.auto.search.application.internal.BaseLucene;
import com.hengyi.japp.mes.auto.search.application.internal.LuceneServiceImpl;
import io.github.classgraph.ClassGraph;
import io.github.classgraph.ClassInfo;
import io.github.classgraph.ScanResult;
import lombok.Cleanup;

import java.time.LocalDate;
import java.util.Date;
import java.util.Map;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2019-11-12
 */
public class MonoTest {
    public static void main(String[] args) {
        final Map<String, Object> map = Map.of("startBudatL", new Date().getTime(), "endBudat", LocalDate.now());
        final PackageBoxQuery query = MAPPER.convertValue(map, PackageBoxQuery.class);
        System.out.println(query);

        @Cleanup ScanResult scanResult = new ClassGraph().enableAllInfo()
                .whitelistPackages(LuceneServiceImpl.class.getPackageName())
                .scan();
        scanResult.getSubclasses(BaseLucene.class.getName()).loadClasses()
                .stream().forEach(System.out::println);

        scanResult = new ClassGraph().enableAllInfo()
                .whitelistPackages(LuceneCommandOne.class.getPackageName())
                .scan();
        final ClassInfo classInfo = scanResult.getClassInfo(LuceneCommandOne.class.getName());
        classInfo.getFieldInfo().forEach(fieldInfo -> {
            System.out.println(fieldInfo);
        });
    }
}
