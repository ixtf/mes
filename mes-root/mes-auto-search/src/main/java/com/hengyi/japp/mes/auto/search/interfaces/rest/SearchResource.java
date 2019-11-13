package com.hengyi.japp.mes.auto.search.interfaces.rest;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.query.DyeingPrepareQuery;
import com.hengyi.japp.mes.auto.query.PackageBoxQuery;
import com.hengyi.japp.mes.auto.query.SilkCarRecordQuery;
import com.hengyi.japp.mes.auto.search.application.LuceneService;
import com.hengyi.japp.mes.auto.search.application.internal.DyeingPrepareLucene;
import com.hengyi.japp.mes.auto.search.application.internal.PackageBoxLucene;
import com.hengyi.japp.mes.auto.search.application.internal.SilkCarRecordLucene;
import reactor.core.publisher.Mono;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import java.util.Map;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * @author jzb 2019-11-12
 */
@Path("search")
@Produces(APPLICATION_JSON)
@Singleton
public class SearchResource {
    private final LuceneService luceneService;
    private final SilkCarRecordLucene silkCarRecordLucene;
    private final PackageBoxLucene packageBoxLucene;
    private final DyeingPrepareLucene dyeingPrepareLucene;

    @Inject
    private SearchResource(LuceneService luceneService, SilkCarRecordLucene silkCarRecordLucene, PackageBoxLucene packageBoxLucene, DyeingPrepareLucene dyeingPrepareLucene) {
        this.luceneService = luceneService;
        this.silkCarRecordLucene = silkCarRecordLucene;
        this.packageBoxLucene = packageBoxLucene;
        this.dyeingPrepareLucene = dyeingPrepareLucene;
    }

    @Path("packageBoxes")
    @GET
    public Mono<Map> packageBoxes(PackageBoxQuery query) {
        return Mono.fromCallable(() -> packageBoxLucene.query(query))
                .map(pair -> Map.of("count", pair.getLeft(), "ids", pair.getRight()));
    }

    @Path("dyeingPrepares")
    @GET
    public Mono<Map> dyeingPrepares(DyeingPrepareQuery query) {
        return Mono.fromCallable(() -> dyeingPrepareLucene.query(query))
                .map(pair -> Map.of("count", pair.getLeft(), "ids", pair.getRight()));
    }

    @Path("silkCarRecords")
    @GET
    public Mono<Map> silkCarRecords(SilkCarRecordQuery query) {
        return Mono.fromCallable(() -> silkCarRecordLucene.query(query))
                .map(pair -> Map.of("count", pair.getLeft(), "ids", pair.getRight()));
    }

}
