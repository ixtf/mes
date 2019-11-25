package test;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.github.ixtf.japp.core.J;
import lombok.SneakyThrows;
import org.apache.commons.lang3.tuple.Pair;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.Collection;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2019-11-25
 */
public class SearchTest {
    private static final HttpClient httpClient = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();

    @SneakyThrows
    public static void main(String[] args) {
        final ObjectNode query = MAPPER.createObjectNode()
                .put("pageSize", 50)
                .put("inWarehouse", true)
                .put("workshopId", "5bffa63d8857b85a437d1fc5")
                .put("startBudatL", J.date(LocalDate.of(2017, 11, 1)).getTime())
                .put("endBudatL", J.date(LocalDate.of(2020, 11, 1)).getTime());
        final byte[] bytes = MAPPER.writeValueAsBytes(query);
        final HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://10.2.0.214:9999/search/packageBoxes"))
                .POST(HttpRequest.BodyPublishers.ofByteArray(bytes))
                .build();
        final HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
        final int statusCode = response.statusCode();
        if (statusCode < 200 || statusCode >= 300) {
            throw new RuntimeException();
        }
        final Pair<Long, Collection<String>> pair = MAPPER.readValue(response.body(), QueryResult.class).pair();
        System.out.println(pair);
    }
}
