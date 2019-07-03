package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.japp.core.J;
import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.query.SilkBarcodeQuery;
import com.hengyi.japp.mes.auto.domain.Batch;
import com.hengyi.japp.mes.auto.domain.LineMachine;
import com.hengyi.japp.mes.auto.domain.SilkBarcode;
import com.hengyi.japp.mes.auto.repository.SilkBarcodeRepository;
import com.hengyi.japp.mes.auto.search.lucene.SilkBarcodeLucene;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import org.bson.conversions.Bson;
import org.eclipse.microprofile.reactive.streams.operators.ReactiveStreams;

import java.time.LocalDate;
import java.util.Optional;
import java.util.concurrent.CompletionStage;

import static com.mongodb.client.model.Filters.eq;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class SilkBarcodeRepositoryMongo extends MongoEntityRepository<SilkBarcode> implements SilkBarcodeRepository {
    private final SilkBarcodeLucene silkBarcodeLucene;

    @Inject
    private SilkBarcodeRepositoryMongo(SilkBarcodeLucene silkBarcodeLucene) {
        this.silkBarcodeLucene = silkBarcodeLucene;
    }

    @Override
    public SilkBarcode save(SilkBarcode silkBarcode) {
        if (J.isBlank(silkBarcode.getCode())) {
            silkBarcode.setCode(silkBarcode.generateCode());
        }
        final SilkBarcode result = super.save(silkBarcode);
        silkBarcodeLucene.index(result);
        return result;
    }

    @SneakyThrows
    @Override
    public Optional<SilkBarcode> findByCode(String code) {
        final Bson condition = unDeletedCondition(eq("code", code));
        return Jmongo.query(entityClass, condition, 0, 1).findFirst().run().toCompletableFuture().get();
    }

    @SneakyThrows
    @Override
    synchronized public Optional<SilkBarcode> find(LocalDate codeLd, LineMachine lineMachine, String doffingNum, Batch batch) {
        final SilkBarcodeQuery silkBarcodeQuery = SilkBarcodeQuery.builder()
                .startLd(codeLd)
                .endLd(codeLd)
                .lineMachineId(lineMachine.getId())
                .doffingNum(doffingNum)
                .batchId(batch.getId())
                .build();
        return ReactiveStreams.of(silkBarcodeQuery)
                .flatMapIterable(silkBarcodeLucene::query)
                .findFirst().run()
                .thenApply(optional -> optional.flatMap(this::find))
                .toCompletableFuture().get();
    }

    @SneakyThrows
    @Override
    public Optional<SilkBarcode> find(LocalDate codeLd, long codeDoffingNum) {
        final SilkBarcodeQuery silkBarcodeQuery = SilkBarcodeQuery.builder()
                .startLd(codeLd)
                .endLd(codeLd)
                .codeDoffingNum(codeDoffingNum)
                .build();
        return ReactiveStreams.of(silkBarcodeQuery)
                .flatMapIterable(silkBarcodeLucene::query)
                .findFirst().run()
                .thenApply(optional -> optional.flatMap(this::find))
                .toCompletableFuture().get();
    }

    @Override
    public CompletionStage<SilkBarcodeQuery.Result> query(SilkBarcodeQuery silkBarcodeQuery) {
        final int first = silkBarcodeQuery.getFirst();
        final int pageSize = silkBarcodeQuery.getPageSize();
        final SilkBarcodeQuery.Result.ResultBuilder builder = SilkBarcodeQuery.Result.builder().first(first).pageSize(pageSize);
        return ReactiveStreams.of(silkBarcodeQuery)
                .map(silkBarcodeLucene::build)
                .map(it -> silkBarcodeLucene.baseQuery(it, first, pageSize))
                .peek(it -> builder.count(it.getKey()))
                .map(Pair::getValue)
                .flatMap(ids -> Jmongo.listById(entityClass, ids))
                .toList().run()
                .thenApply(silkBarcodes -> builder.silkBarcodes(silkBarcodes).build());
    }

    @SneakyThrows
    @Override
    public void index(SilkBarcode silkBarcode) {
        silkBarcodeLucene.index(silkBarcode);
    }

    @Override
    public void delete(String id) {
    }
}
