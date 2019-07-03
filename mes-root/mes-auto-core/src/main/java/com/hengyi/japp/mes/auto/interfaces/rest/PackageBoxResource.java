package com.hengyi.japp.mes.auto.interfaces.rest;

import com.github.ixtf.japp.core.J;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.PackageBoxService;
import com.hengyi.japp.mes.auto.application.command.PackageBoxAppendCommand;
import com.hengyi.japp.mes.auto.application.command.PackageBoxBatchPrintUpdateCommand;
import com.hengyi.japp.mes.auto.application.command.PackageBoxMeasureInfoUpdateCommand;
import com.hengyi.japp.mes.auto.application.query.LocalDateRange;
import com.hengyi.japp.mes.auto.application.query.PackageBoxQuery;
import com.hengyi.japp.mes.auto.application.query.PackageBoxQueryForMeasure;
import com.hengyi.japp.mes.auto.domain.PackageBox;
import com.hengyi.japp.mes.auto.domain.Silk;
import com.hengyi.japp.mes.auto.domain.SilkCarRecord;
import com.hengyi.japp.mes.auto.domain.data.PackageBoxType;
import com.hengyi.japp.mes.auto.repository.PackageBoxRepository;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.ws.rs.*;
import java.security.Principal;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * @author jzb 2018-11-02
 */
@Singleton
@Path("api")
@Produces(APPLICATION_JSON)
public class PackageBoxResource {
    private final PackageBoxService packageBoxService;
    private final PackageBoxRepository packageBoxRepository;

    @Inject
    private PackageBoxResource(PackageBoxService packageBoxService, PackageBoxRepository packageBoxRepository) {
        this.packageBoxService = packageBoxService;
        this.packageBoxRepository = packageBoxRepository;
    }

    @Path("packageBoxAppend")
    @POST
    public PackageBox handle(Principal principal, PackageBoxAppendCommand command) {
        return packageBoxService.handle(principal, command);
    }

    @Path("packageBoxes/{id}")
    @GET
    public Optional<PackageBox> get(@PathParam("id") String id) {
        return packageBoxRepository.find(id);
    }

    @Path("packageBoxes/{id}/silks")
    @GET
    public Collection<Silk> silks(@PathParam("id") String id) {
        return packageBoxRepository.find(id).map(PackageBox::getSilks).orElseGet(Collections::emptyList);
    }

    @Path("packageBoxes/{id}/silkCarRecords")
    @GET
    public Collection<SilkCarRecord> silkCarRecords(@PathParam("id") String id) {
        return packageBoxRepository.find(id).map(PackageBox::getSilkCarRecords).orElseGet(Collections::emptyList);
    }

    @Path("packageBoxes/{id}")
    @DELETE
    public void delete(Principal principal, @PathParam("id") String id) {
        packageBoxService.delete(principal, id);
    }

    @Path("packageBoxes/{id}/print")
    @PUT
    public void print(Principal principal, @PathParam("id") String id) {
        packageBoxService.print(principal, id);
    }

    @Path("packageBoxBatchPrint")
    @POST
    public void print(Principal principal, PackageBoxBatchPrintUpdateCommand command) {
        packageBoxService.print(principal, command);
    }

    @Path("packageBoxes/{id}/measureInfo")
    @PUT
    public PackageBox list(Principal principal, @PathParam("id") String id, PackageBoxMeasureInfoUpdateCommand command) {
        return packageBoxService.update(principal, id, command);
    }

    /**
     * 已入库
     */
    @Path("packageBoxes")
    @GET
    public CompletionStage<PackageBoxQuery.Result> query(@QueryParam("first") @DefaultValue("0") @Min(0) int first,
                                                         @QueryParam("pageSize") @DefaultValue("50") @Min(1) int pageSize,
                                                         @QueryParam("workshopId") @NotBlank String workshopId,
                                                         @QueryParam("startDate") @NotBlank String startDate,
                                                         @QueryParam("endDate") @NotBlank String endDate,
                                                         @QueryParam("packageBoxType") String typeString,
                                                         @QueryParam("packageBoxCode") String packageBoxCode,
                                                         @QueryParam("budatClassId") String budatClassId,
                                                         @QueryParam("gradeId") String gradeId,
                                                         @QueryParam("batchId") String batchId,
                                                         @QueryParam("productId") String productId) {
        final Set<String> budatClassIds = J.nonBlank(budatClassId) ? Sets.newHashSet(budatClassId) : Collections.EMPTY_SET;
        final LocalDate startLd = Optional.ofNullable(startDate)
                .filter(J::nonBlank)
                .map(LocalDate::parse)
                .orElse(LocalDate.now());
        final LocalDate endLd = Optional.ofNullable(endDate)
                .filter(J::nonBlank)
                .map(LocalDate::parse)
                .orElse(LocalDate.now());
        final PackageBoxType type = Optional.ofNullable(typeString)
                .filter(J::nonBlank)
                .map(PackageBoxType::valueOf)
                .orElse(null);
        final PackageBoxQuery packageBoxQuery = PackageBoxQuery.builder()
                .first(first)
                .pageSize(pageSize)
                .budatRange(new LocalDateRange(startLd, endLd.plusDays(1)))
                .type(type)
                .packageBoxCode(packageBoxCode)
                .workshopId(workshopId)
                .gradeId(gradeId)
                .batchId(batchId)
                .productId(productId)
                .budatClassIds(budatClassIds)
                .build();
        return packageBoxRepository.query(packageBoxQuery);
    }

    /**
     * 待入库
     */
    @Path("measurePackageBoxes")
    @GET
    public CompletionStage<PackageBoxQueryForMeasure.Result> queryPrepare(@QueryParam("first") @DefaultValue("0") @Min(0) int first,
                                                                          @QueryParam("pageSize") @DefaultValue("50") @Min(1) int pageSize,
                                                                          @QueryParam("workshopId") @NotBlank String workshopId,
                                                                          @QueryParam("startDate") @NotBlank String startDate,
                                                                          @QueryParam("endDate") @NotBlank String endDate,
                                                                          @QueryParam("packageBoxType") String typeString,
                                                                          @QueryParam("packageBoxCode") String packageBoxCode,
                                                                          @QueryParam("netWeight") double netWeight,
                                                                          @QueryParam("gradeId") String gradeId,
                                                                          @QueryParam("batchId") String batchId,
                                                                          @QueryParam("productId") String productId,
                                                                          @QueryParam("creatorId") String creatorId) {
        final LocalDate startLd = Optional.ofNullable(startDate)
                .filter(J::nonBlank)
                .map(LocalDate::parse)
                .orElse(LocalDate.now());
        final LocalDate endLd = Optional.ofNullable(endDate)
                .filter(J::nonBlank)
                .map(LocalDate::parse)
                .orElse(LocalDate.now());
        final PackageBoxType type = Optional.ofNullable(typeString)
                .filter(J::nonBlank)
                .map(PackageBoxType::valueOf)
                .orElse(null);
        final PackageBoxQueryForMeasure packageBoxQuery = PackageBoxQueryForMeasure.builder()
                .first(first)
                .pageSize(pageSize)
                .createDateTimeRange(new LocalDateRange(startLd, endLd.plusDays(1)))
                .type(type)
                .packageBoxCode(packageBoxCode)
                .workshopId(workshopId)
                .gradeId(gradeId)
                .batchId(batchId)
                .productId(productId)
                .creatorId(creatorId)
                .netWeight(netWeight)
                .build();
        return packageBoxRepository.query(packageBoxQuery);
    }

    /**
     * 打包工，当天，打包列表
     */
    @Path("currentSelPackageBoxes")
    @GET
    public CompletionStage<Map<String, Object>> queryPrepare(Principal principal,
                                                             @QueryParam("first") @DefaultValue("0") @Min(0) int first,
                                                             @QueryParam("pageSize") @DefaultValue("50") @Min(1) int pageSize) {
        final Map<String, Object> result = Maps.newConcurrentMap();
        final LocalDateRange ldRange = new LocalDateRange(LocalDate.now(), LocalDate.now().plusDays(1));
        final PackageBoxQueryForMeasure packageBoxQueryForMeasure = PackageBoxQueryForMeasure.builder()
                .first(first)
                .pageSize(pageSize)
                .createDateTimeRange(ldRange)
                .type(PackageBoxType.MANUAL)
                .creatorId(principal.getName())
                .build();
        final PackageBoxQuery packageBoxQuery = PackageBoxQuery.builder()
                .first(first)
                .pageSize(pageSize)
                .budatRange(ldRange)
                .type(PackageBoxType.MANUAL)
                .creatorId(principal.getName())
                .build();
        final CompletableFuture<Void> warehouseResult = packageBoxRepository.query(packageBoxQuery)
                .thenAccept(it -> result.put("warehouseResult", it))
                .toCompletableFuture();
        final CompletableFuture<Object> measureResult = packageBoxRepository.query(packageBoxQueryForMeasure)
                .thenApply(it -> result.put("measureResult", it))
                .toCompletableFuture();
        return CompletableFuture.allOf(warehouseResult, measureResult).thenApply(it -> result);
    }

}
