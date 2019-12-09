package test;

import com.github.ixtf.persistence.IEntity;
import com.github.ixtf.persistence.lucene.LuceneCommandOne;
import com.github.ixtf.persistence.mongo.Jmongo;
import com.hengyi.japp.mes.auto.domain.SilkBarcode;
import com.hengyi.japp.mes.auto.search.SearchModule;
import com.mongodb.reactivestreams.client.MongoCollection;
import io.vertx.core.Vertx;
import lombok.SneakyThrows;
import org.bson.Document;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.rabbitmq.ExceptionHandlers;
import reactor.rabbitmq.OutboundMessage;
import reactor.rabbitmq.SendOptions;
import reactor.rabbitmq.Sender;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;

import static com.github.ixtf.japp.core.Constant.MAPPER;
import static com.github.ixtf.persistence.mongo.Jmongo.ID_COL;
import static com.hengyi.japp.mes.auto.Constant.AMQP.MES_AUTO_SEARCH_INDEX_QUEUE;

/**
 * @author jzb 2019-11-12
 */
public class MonoTest {
    private static final SendOptions sendOptions = new SendOptions().exceptionHandler(
            new ExceptionHandlers.RetrySendingExceptionHandler(
                    Duration.ofHours(1), Duration.ofMinutes(5),
                    ExceptionHandlers.CONNECTION_RECOVERY_PREDICATE
            )
    );

    @SneakyThrows
    public static void main(String[] args) {
        final Vertx vertx = Vertx.vertx();
        SearchModule.init(vertx);

        final Jmongo jmongo = SearchModule.getInstance(Jmongo.class);
        final Sender sender = SearchModule.getInstance(Sender.class);
        final MongoCollection<Document> T_SilkBarcode = jmongo.collection(SilkBarcode.class);

        Map<String, Object> map = Map.of("test", Optional.ofNullable(null));
        System.out.println(MAPPER.writeValueAsString(map));

//        final Flux<OutboundMessage> messages$ = flux( SilkCarRecord.class);

//        final MongoCollection<Document> T_PackageBox = jmongo.collection(PackageBox.class);
//        final Bson budat1 = gte("budat", J.date(LocalDate.of(2019, 11, 1)));
//        final Flux<OutboundMessage> messages$ = Flux.from(T_PackageBox.find(and(budat1)))
//                .flatMap(document -> {
//                    final LuceneCommandOne command = new LuceneCommandOne();
//                    command.setClassName(PackageBox.class.getName());
//                    command.setId(document.getString(ID_COL));
//                    return Mono.fromCallable(() -> MAPPER.writeValueAsBytes(command));
//                })
//                .map(body -> new OutboundMessage("", MES_AUTO_SEARCH_INDEX_QUEUE, body));
//        sender.send(messages$, sendOptions).doOnSuccess(it -> {
//            System.out.println("success");
//        }).subscribe();
    }

    private static Flux<OutboundMessage> flux(Class<? extends IEntity> clazz) {
        final Jmongo jmongo = SearchModule.getInstance(Jmongo.class);
        return Flux.from(jmongo.collection(clazz).find())
                .flatMap(document -> {
                    final LuceneCommandOne command = new LuceneCommandOne();
                    command.setClassName(clazz.getName());
                    command.setId(document.getString(ID_COL));
                    return Mono.fromCallable(() -> MAPPER.writeValueAsBytes(command));
                })
                .map(body -> new OutboundMessage("", MES_AUTO_SEARCH_INDEX_QUEUE, body));
    }
}
