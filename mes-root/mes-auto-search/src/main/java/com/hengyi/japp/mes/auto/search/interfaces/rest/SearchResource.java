package com.hengyi.japp.mes.auto.search.interfaces.rest;

import com.github.ixtf.persistence.lucene.LuceneCommandAll;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.query.*;
import com.hengyi.japp.mes.auto.search.application.LuceneService;
import com.hengyi.japp.mes.auto.search.application.internal.DyeingPrepareLucene;
import com.hengyi.japp.mes.auto.search.application.internal.PackageBoxLucene;
import com.hengyi.japp.mes.auto.search.application.internal.SilkBarcodeLucene;
import com.hengyi.japp.mes.auto.search.application.internal.SilkCarRecordLucene;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import java.util.Collection;
import java.util.Map;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;
import static javax.ws.rs.core.MediaType.TEXT_PLAIN;

/**
 * @author jzb 2019-11-12
 */
@Singleton
@Path("search")
@Produces(APPLICATION_JSON)
public class SearchResource {
    private final LuceneService luceneService;
    private final SilkCarRecordLucene silkCarRecordLucene;
    private final PackageBoxLucene packageBoxLucene;
    private final DyeingPrepareLucene dyeingPrepareLucene;
    private final SilkBarcodeLucene silkBarcodeLucene;

    @Inject
    private SearchResource(LuceneService luceneService, SilkCarRecordLucene silkCarRecordLucene, PackageBoxLucene packageBoxLucene, DyeingPrepareLucene dyeingPrepareLucene, SilkBarcodeLucene silkBarcodeLucene) {
        this.luceneService = luceneService;
        this.silkCarRecordLucene = silkCarRecordLucene;
        this.packageBoxLucene = packageBoxLucene;
        this.dyeingPrepareLucene = dyeingPrepareLucene;
        this.silkBarcodeLucene = silkBarcodeLucene;
    }

    @Path("indexAll")
    @POST
    @Produces(TEXT_PLAIN)
    public Mono<String> indexAll(LuceneCommandAll command) {
        return Mono.fromCallable(() -> luceneService.get(command.getClazz()).indexAll())
                .subscribeOn(Schedulers.elastic());
    }

    @Path("packageBoxes")
    @POST
    public Mono<Map> packageBoxes(PackageBoxQuery query) {
        return Mono.fromCallable(() -> packageBoxLucene.query(query))
                .map(pair -> Map.of("count", pair.getLeft(), "ids", pair.getRight()));
    }

    @Path("dyeingPrepares")
    @POST
    public Mono<Map> dyeingPrepares(DyeingPrepareQuery query) {
        return Mono.fromCallable(() -> dyeingPrepareLucene.query(query))
                .map(pair -> Map.of("count", pair.getLeft(), "ids", pair.getRight()));
    }

    @Path("silkCarRecords")
    @POST
    public Mono<Map> silkCarRecords(SilkCarRecordQuery query) {
        return Mono.fromCallable(() -> silkCarRecordLucene.query(query))
                .map(pair -> Map.of("count", pair.getLeft(), "ids", pair.getRight()));
    }

    @Path("silkCarRecordsByEventSourceCanHappen")
    @POST
    public Mono<Collection<String>> silkCarRecords(SilkCarRecordQueryByEventSourceCanHappen query) {
        return Mono.fromCallable(() -> silkCarRecordLucene.query(query));
    }

    @Path("silkBarcodes")
    @POST
    public Mono<Map> silkBarcodes(SilkBarcodeQuery query) {
        return Mono.fromCallable(() -> silkBarcodeLucene.query(query))
                .map(pair -> Map.of("count", pair.getLeft(), "ids", pair.getRight()));
    }

}
