package com.hengyi.japp.mes.auto.interfaces.rest;

import com.github.ixtf.japp.core.J;
import com.google.common.collect.ImmutableMap;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.query.SilkQuery;
import com.hengyi.japp.mes.auto.domain.DyeingSample;
import com.hengyi.japp.mes.auto.domain.Silk;
import com.hengyi.japp.mes.auto.repository.DyeingSampleRepository;
import com.hengyi.japp.mes.auto.repository.SilkRepository;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.ws.rs.*;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletionStage;

import static java.util.stream.Collectors.toList;
import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * @author jzb 2018-11-02
 */
@Singleton
@Path("api")
@Produces(APPLICATION_JSON)
public class DyeingSampleResource {
    private final DyeingSampleRepository dyeingSampleRepository;
    private final SilkRepository silkRepository;

    @Inject
    private DyeingSampleResource(DyeingSampleRepository dyeingSampleRepository, SilkRepository silkRepository) {
        this.dyeingSampleRepository = dyeingSampleRepository;
        this.silkRepository = silkRepository;
    }

    @Path("dyeingSamples/{code}")
    @GET
    public Optional<DyeingSample> get(@PathParam("code") @NotBlank String code) {
        return dyeingSampleRepository.findByCode(code);
    }

    @Path("dyeingSamples")
    @GET
    public CompletionStage<Map> query(@QueryParam("first") @DefaultValue("0") @Min(0) int first,
                                      @QueryParam("pageSize") @DefaultValue("50") @Min(1) int pageSize,
                                      @QueryParam("batchId") String batchId) {
        final SilkQuery silkQuery = SilkQuery.builder()
                .first(first)
                .pageSize(pageSize)
                .batchId(batchId)
                .isDyeingSample(true)
                .build();
        return silkRepository.query(silkQuery).thenApply(silkQueryResult -> {
            final Collection<Silk> silks = J.emptyIfNull(silkQueryResult.getSilks());
            final List<DyeingSample> dyeingSamples = J.emptyIfNull(silkQueryResult.getSilks())
                    .parallelStream()
                    .map(dyeingSampleRepository::find)
                    .map(Optional::get)
                    .collect(toList());
            return ImmutableMap.of(
                    "count", silkQueryResult.getCount(),
                    "first", silkQueryResult.getFirst(),
                    "pageSize", silkQueryResult.getPageSize(),
                    "dyeingSamples", dyeingSamples
            );
        });
    }
}
