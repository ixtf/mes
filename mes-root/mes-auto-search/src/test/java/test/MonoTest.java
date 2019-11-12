package test;

import reactor.core.publisher.Mono;

import java.net.URLEncoder;

/**
 * @author jzb 2019-11-12
 */
public class MonoTest {
    public static void main(String[] args) {
        System.out.println(URLEncoder.encode("mes-auto-mongo@com.hengyi.japp"));
        Mono.just("").doOnNext(MonoTest::test).then()
                .doOnError(err -> err.printStackTrace())
                .doOnSuccess(it -> System.out.println("doOnSuccess " + it))
                .subscribe();
    }

    private static void test(String s) {
        System.out.println("test");
    }
}
