package test;

import com.hengyi.japp.mes.auto.query.PackageBoxQuery;

import java.util.Date;
import java.util.Map;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2019-11-12
 */
public class MonoTest {
    public static void main(String[] args) {
        final Map<String, Object> map = Map.of("startBudat", new Date().getTime());
        final PackageBoxQuery query = MAPPER.convertValue(map, PackageBoxQuery.class);
        System.out.println(query);
    }
}
