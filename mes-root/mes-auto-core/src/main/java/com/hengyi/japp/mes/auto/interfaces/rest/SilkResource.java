package com.hengyi.japp.mes.auto.interfaces.rest;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.SilkService;
import com.hengyi.japp.mes.auto.application.command.SilkInspectionExceptionUpdateCommand;
import com.hengyi.japp.mes.auto.application.query.SilkQuery;
import com.hengyi.japp.mes.auto.domain.PackageBox;
import com.hengyi.japp.mes.auto.domain.Silk;
import com.hengyi.japp.mes.auto.domain.SilkCarRecord;
import com.hengyi.japp.mes.auto.repository.SilkRepository;

import javax.validation.constraints.Min;
import javax.ws.rs.*;
import java.security.Principal;
import java.util.Collection;
import java.util.Collections;
import java.util.Optional;
import java.util.concurrent.CompletionStage;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * @author jzb 2018-11-02
 */
@Singleton
@Path("api")
@Produces(APPLICATION_JSON)
public class SilkResource {
    private final SilkService silkService;
    private final SilkRepository silkRepository;

    @Inject
    private SilkResource(SilkService silkService, SilkRepository silkRepository) {
        this.silkService = silkService;
        this.silkRepository = silkRepository;
    }

    @Path("silks/{id}")
    @GET
    public Optional<Silk> get(@PathParam("id") String id) {
        return silkRepository.find(id);
    }

    @Path("silks/{id}/exception")
    @PUT
    public Silk get(Principal principal, @PathParam("id") String id, SilkInspectionExceptionUpdateCommand command) {
        return silkService.update(principal, id, command);
    }

    @Path("silks/{id}/packageBox")
    @GET
    public Optional<PackageBox> packageBox(@PathParam("id") String id) {
        return silkRepository.find(id).map(Silk::getPackageBox);
    }

    @Path("silks/{id}/silkCarRecords")
    @GET
    public Collection<SilkCarRecord> silkCarRecords(@PathParam("id") String id) {
        return silkRepository.find(id).map(Silk::getSilkCarRecords).orElseGet(Collections::emptyList);
    }

    @Path("silks/codes/{code}")
    @GET
    public Optional<Silk> getByCode(@PathParam("code") String code) {
        return silkRepository.findByCode(code);
    }

    @Path("silks")
    @GET
    public CompletionStage<SilkQuery.Result> query(@QueryParam("first") @DefaultValue("0") @Min(0) int first,
                                                   @QueryParam("pageSize") @DefaultValue("50") @Min(1) int pageSize,
                                                   @QueryParam("batchId") String batchId,
                                                   @QueryParam("workshopId") String workshopId) {
        final SilkQuery silkQuery = SilkQuery.builder()
                .first(first)
                .pageSize(pageSize)
                .batchId(batchId)
                .workshopId(workshopId)
                .build();
        return silkRepository.query(silkQuery);
    }

}
