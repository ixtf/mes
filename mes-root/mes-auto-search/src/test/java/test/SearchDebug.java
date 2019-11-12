package test;

import com.github.ixtf.persistence.lucene.LuceneCommand;
import com.hengyi.japp.mes.auto.domain.PackageBox;
import com.hengyi.japp.mes.auto.search.MainVerticle;
import com.hengyi.japp.mes.auto.search.SearchModule;
import com.hengyi.japp.mes.auto.search.verticle.LuceneVerticle;
import io.vertx.core.AsyncResult;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import lombok.SneakyThrows;
import reactor.core.publisher.Mono;
import reactor.rabbitmq.ExceptionHandlers;
import reactor.rabbitmq.OutboundMessage;
import reactor.rabbitmq.SendOptions;
import reactor.rabbitmq.Sender;

import java.time.Duration;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2019-11-12
 */
public class SearchDebug {
    private static final SendOptions sendOptions = new SendOptions().exceptionHandler(
            new ExceptionHandlers.RetrySendingExceptionHandler(
                    Duration.ofHours(1), Duration.ofMinutes(5),
                    ExceptionHandlers.CONNECTION_RECOVERY_PREDICATE
            )
    );

    public static void main(String[] args) {
        Vertx.vertx().deployVerticle(MainVerticle::new, new DeploymentOptions(), SearchDebug::test);
    }

    @SneakyThrows
    private static void test(AsyncResult<String> asyncResult) {
        final Sender sender = SearchModule.getInstance(Sender.class);
        final LuceneCommand command = new LuceneCommand();
        command.setClassName(PackageBox.class.getName());
        command.setId("5c00e6988a19c40001147095");
        final byte[] body = MAPPER.writeValueAsBytes(command);
        final OutboundMessage outboundMessage = new OutboundMessage("", LuceneVerticle.INDEX_QUEUE, body);
        final Mono<OutboundMessage> outboundMessageMono = Mono.just(outboundMessage);
        sender.send(outboundMessageMono, sendOptions)
                .doOnError(err -> err.printStackTrace())
                .subscribe();
    }
}
