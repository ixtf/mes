package test;

import com.github.ixtf.japp.core.J;
import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.common.collect.Maps;
import com.hengyi.japp.mes.auto.domain.PackageBox;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2019-11-25
 */
public class SearchTest {
    private static final HttpClient httpClient = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();

    public static void main(String[] args) {
        testPackageBox();
//        testDyingPrepare();
//        testSilkBarcode();
//        testSilkCarRecord();
    }

    @SneakyThrows
    private static void testSilkCarRecord() {
        final Map<String, Object> map = Maps.newHashMap();
        map.put("pageSize", 50);
        map.put("silkCarCode", "5000P0548");
        map.put("startDateTime", J.date(LocalDate.of(2019, 10, 16)));
        map.put("endDateTime", J.date(LocalDate.of(2019, 10, 17)));

        final byte[] bytes = MAPPER.writeValueAsBytes(map);
        final HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://10.2.0.214:9999/search/silkCarRecords"))
                .POST(HttpRequest.BodyPublishers.ofByteArray(bytes))
                .build();
        final HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        final int statusCode = response.statusCode();
        if (statusCode < 200 || statusCode >= 300) {
            System.out.println(response.body());
            throw new RuntimeException();
        }
        System.out.println(response.body());
    }

    @SneakyThrows
    private static void testSilkBarcode() {
        final Map<String, Object> map = Maps.newHashMap();
        map.put("pageSize", 50);
        map.put("lineId", "5bffa63d8857b85a437d1fd8");
        map.put("startCodeDate", LocalDate.of(2019, 11, 1));
        map.put("endCodeDate", LocalDate.of(2019, 12, 1));

        final byte[] bytes = MAPPER.writeValueAsBytes(map);
        final HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://10.2.0.214:9999/search/silkBarcodes"))
                .POST(HttpRequest.BodyPublishers.ofByteArray(bytes))
                .build();
        final HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        final int statusCode = response.statusCode();
        if (statusCode < 200 || statusCode >= 300) {
            System.out.println(response.body());
            throw new RuntimeException();
        }
        System.out.println(response.body());
    }

    @SneakyThrows
    private static void testDyingPrepare() {
        final Map<String, Object> map = Maps.newHashMap();
        map.put("pageSize", 50);
        map.put("inWarehouse", true);
        map.put("workshopId", "5bffa63d8857b85a437d1fc5");
//        map.put("batchId", "5d64c1fa7e875f00015df1cd");
//        map.put("gradeId", "1770980569354600486");
        map.put("startDate", 1575475200000l);
        map.put("endDate", 1575509814203l);

        final byte[] bytes = MAPPER.writeValueAsBytes(map);
        final HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://10.2.0.214:9999/search/dyeingPrepares"))
                .POST(HttpRequest.BodyPublishers.ofByteArray(bytes))
                .build();
        final HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        final int statusCode = response.statusCode();
        if (statusCode < 200 || statusCode >= 300) {
            System.out.println(response.body());
            throw new RuntimeException();
        }
        System.out.println(response.body());
    }

    @SneakyThrows
    private static void testPackageBox() {
        final Map<String, Object> map = Maps.newHashMap();
        map.put("pageSize", 550);
        map.put("inWarehouse", true);
        map.put("workshopId", "5c6d5f353d004500015bf451");
        map.put("batchId", "5c7733c026e0ff000160100d");
        map.put("gradeId", "1770980569354600486");
        map.put("startBudat", LocalDate.of(2019, 12, 19));
        map.put("endBudat", LocalDate.of(2019, 12, 20));

        final byte[] bytes = MAPPER.writeValueAsBytes(map);
        final HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://10.2.0.214:9999/search/packageBoxes"))
                .POST(HttpRequest.BodyPublishers.ofByteArray(bytes))
                .build();
        final HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        final int statusCode = response.statusCode();
        if (statusCode < 200 || statusCode >= 300) {
            System.out.println(response.body());
            throw new RuntimeException();
        }

        final Jmongo jmongo = Jmongo.of(Jmongo3000.class);
        final QueryResult queryResult = MAPPER.readValue(response.body(), QueryResult.class);
        final List<PackageBox> block = jmongo.find(PackageBox.class, Flux.fromIterable(queryResult.getIds())).collectList().block();
        final double sumNetWeight = block.stream().mapToDouble(PackageBox::getNetWeight).sum();
        final double sumSilkCount = block.stream().mapToDouble(PackageBox::getSilkCount).sum();
        System.out.println(block.size());
        System.out.println(sumNetWeight);
        System.out.println(sumSilkCount);
        final List<PackageBox> collect = block.stream().filter(packageBox -> {
            final double test = packageBox.getNetWeight() / packageBox.getSilkCount();
            return ((int) test) != 8;
        }).collect(Collectors.toList());
        System.out.println(collect);
    }
}
