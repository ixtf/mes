package com.hengyi.japp.mes.auto.interfaces.rest;

import com.github.ixtf.japp.core.J;
import com.google.common.collect.Maps;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.ProductPlanNotifyService;
import com.hengyi.japp.mes.auto.application.command.ProductPlanNotifyExeCommand;
import com.hengyi.japp.mes.auto.application.command.ProductPlanNotifyUpdateCommand;
import com.hengyi.japp.mes.auto.application.query.ProductPlanNotifyQuery;
import com.hengyi.japp.mes.auto.domain.LineMachine;
import com.hengyi.japp.mes.auto.domain.ProductPlanNotify;
import com.hengyi.japp.mes.auto.repository.ProductPlanNotifyRepository;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.ws.rs.*;
import java.security.Principal;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletionStage;
import java.util.stream.Collectors;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * @author jzb 2018-11-02
 */
@Singleton
@Path("api")
@Produces(APPLICATION_JSON)
public class ProductPlanNotifyResource {
    private final ProductPlanNotifyService productPlanNotifyService;
    private final ProductPlanNotifyRepository productPlanNotifyRepository;

    @Inject
    private ProductPlanNotifyResource(ProductPlanNotifyService productPlanNotifyService, ProductPlanNotifyRepository productPlanNotifyRepository) {
        this.productPlanNotifyService = productPlanNotifyService;
        this.productPlanNotifyRepository = productPlanNotifyRepository;
    }

    @Path("productPlanNotifies")
    @POST
    public ProductPlanNotify create(Principal principal, ProductPlanNotifyUpdateCommand command) {
        return productPlanNotifyService.create(principal, command);
    }

    @Path("productPlanNotifies/{id}")
    @PUT
    public ProductPlanNotify update(Principal principal, @PathParam("id") @NotBlank String id, ProductPlanNotifyUpdateCommand command) {
        return productPlanNotifyService.update(principal, id, command);
    }

    @Path("productPlanNotifies/{id}")
    @GET
    public Optional<ProductPlanNotify> get(@PathParam("id") @NotBlank String id) {
        return productPlanNotifyRepository.find(id);
    }

//    @Path("productPlanNotifies/{id}")
//    @DELETE
//    @Produces(APPLICATION_JSON)
//    public Single<Grade> delete(Principal principal, @PathParam("id") @NotBlank String id) {
//        return productPlanNotifyService.find(id);
//    }

    @Path("productPlanNotifies/{id}/exe")
    @POST
    public void exe(Principal principal, @PathParam("id") @NotBlank String id, ProductPlanNotifyExeCommand command) {
        productPlanNotifyService.exe(principal, id, command);
    }

    @Path("productPlanNotifies/{id}/unExe")
    @DELETE
    public void unExe(Principal principal, @PathParam("id") @NotBlank String id, ProductPlanNotifyExeCommand command) {
        productPlanNotifyService.unExe(principal, id, command);
    }

    @Path("productPlanNotifies/{id}/batchExe")
    @POST
    public void get(Principal principal, @PathParam("id") @NotBlank String id, ProductPlanNotifyExeCommand.Batch commands) {
        commands.getLineMachines().parallelStream()
                .map(it -> {
                    final ProductPlanNotifyExeCommand command = new ProductPlanNotifyExeCommand();
                    command.setLineMachine(it);
                    return command;
                })
                .forEach(command -> productPlanNotifyService.exe(principal, id, command));
    }

    @Path("productPlanNotifies/{id}/exeInfo")
    @GET
    public Map exeInfo(@PathParam("id") @NotBlank String id) {
        final Map<String, Object> result = Maps.newHashMap();
        final ProductPlanNotify productPlanNotify = productPlanNotifyRepository.find(id).get();
        result.put("productPlanNotify", productPlanNotify);
        final var lineMachineProductPlans = J.emptyIfNull(productPlanNotify.getLineMachines())
                .parallelStream()
                .filter(lineMachine -> lineMachine.getProductPlan() != null)
                .map(LineMachine::getProductPlan)
                .collect(Collectors.toList());
        result.put("lineMachineProductPlans", lineMachineProductPlans);
        return result;
    }

    @Path("productPlanNotifies/{id}/finish")
    @PUT
    public void finish(Principal principal, @PathParam("id") @NotBlank String id) {
        productPlanNotifyService.finish(principal, id);
    }

    @Path("productPlanNotifies/{id}/finish")
    @DELETE
    public void unFinish(Principal principal, @PathParam("id") @NotBlank String id) {
        productPlanNotifyService.unFinish(principal, id);
    }

    @Path("productPlanNotifies")
    @GET
    public CompletionStage<ProductPlanNotifyQuery.Result> query(@QueryParam("first") @DefaultValue("0") @Min(0) int first,
                                                                @QueryParam("pageSize") @DefaultValue("50") @Min(1) int pageSize,
                                                                @QueryParam("q") String q) {
        final ProductPlanNotifyQuery productPlanNotifyQuery = ProductPlanNotifyQuery.builder()
                .first(first)
                .pageSize(pageSize)
                .q(q)
                .build();
        return productPlanNotifyRepository.query(productPlanNotifyQuery);
    }
}
