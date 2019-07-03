package com.hengyi.japp.mes.auto.interfaces.rest;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.SilkBarcodeService;
import com.hengyi.japp.mes.auto.application.command.SilkBarcodeGenerateCommand;
import com.hengyi.japp.mes.auto.application.query.SilkBarcodeQuery;
import com.hengyi.japp.mes.auto.domain.SilkBarcode;
import com.hengyi.japp.mes.auto.repository.SilkBarcodeRepository;
import org.apache.commons.lang3.StringUtils;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.ws.rs.*;
import java.security.Principal;
import java.time.LocalDate;
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
public class SilkBarcodeResource {
    private final SilkBarcodeService silkBarcodeService;
    private final SilkBarcodeRepository silkBarcodeRepository;

    @Inject
    private SilkBarcodeResource(SilkBarcodeService silkBarcodeService, SilkBarcodeRepository silkBarcodeRepository) {
        this.silkBarcodeService = silkBarcodeService;
        this.silkBarcodeRepository = silkBarcodeRepository;
    }

    @Path("silkBarcodes")
    @POST
    public SilkBarcode create(Principal principal, SilkBarcodeGenerateCommand command) {
        return silkBarcodeService.generate(principal, command);
    }

    @Path("batchSilkBarcodes")
    @POST
    public void create(Principal principal, SilkBarcodeGenerateCommand.Batch commands) {
        commands.getCommands().forEach(command -> silkBarcodeService.generate(principal, command));
    }

    @Path("silkBarcodes/{id}")
    @GET
    public Optional<SilkBarcode> get(@PathParam("id") @NotBlank String id) {
        return silkBarcodeRepository.find(id);
    }

//    @Path("silkBarcodes/{id}")
//    @DELETE
//    public void delete(Principal principal, @PathParam("id") @NotBlank String id) {
//        silkBarcodeRepository.delete(id);
//    }

    @Path("silkBarcodes/{id}/silkInfo")
    @GET
    public Collection<SilkBarcode.SilkInfo> silkInfo(@PathParam("id") @NotBlank String id) {
        return silkBarcodeRepository.find(id).map(SilkBarcode::listSilkInfo).orElseGet(Collections::emptyList);
    }

    @Path("silkBarcodes")
    @GET
    public CompletionStage<SilkBarcodeQuery.Result> query(@QueryParam("first") @DefaultValue("0") @Min(0) int first,
                                                          @QueryParam("pageSize") @DefaultValue("50") @Min(1) int pageSize,
                                                          @QueryParam("startDate") String startDate,
                                                          @QueryParam("endDate") String endDate,
                                                          @QueryParam("lineId") String lineId,
                                                          @QueryParam("lineMachineId") String lineMachineId,
                                                          @QueryParam("doffingNum") String doffingNum) {
        final LocalDate startLd = Optional.ofNullable(startDate)
                .map(LocalDate::parse)
                .orElse(LocalDate.now());
        final LocalDate endLd = Optional.ofNullable(endDate)
                .map(LocalDate::parse)
                .orElse(LocalDate.now());
        final SilkBarcodeQuery silkBarcodeQuery = SilkBarcodeQuery.builder()
                .first(first)
                .pageSize(pageSize)
                .startLd(startLd)
                .endLd(endLd)
                .doffingNum(StringUtils.upperCase(doffingNum))
                .lineId(lineId)
                .lineMachineId(lineMachineId)
                .build();
        return silkBarcodeRepository.query(silkBarcodeQuery);
    }

}
