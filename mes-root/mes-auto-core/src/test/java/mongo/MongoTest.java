package mongo;

import com.hengyi.japp.mes.auto.query.PackageBoxQuery;
import lombok.SneakyThrows;
import org.junit.Test;

import java.text.ParseException;
import java.util.Date;
import java.util.Map;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2018-06-20
 */
public class MongoTest {
    @SneakyThrows
    @Test
    public void testObjectId() throws ParseException {
        Map map = Map.of("startBudat", new Date().getTime());
        final PackageBoxQuery query = MAPPER.convertValue(map, PackageBoxQuery.class);
        System.out.println(query);
    }
}
