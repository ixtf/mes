package com.hengyi.japp.mes.auto.interfaces.rest;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.LineMachineService;
import com.hengyi.japp.mes.auto.application.command.LineMachineUpdateCommand;
import com.hengyi.japp.mes.auto.domain.LineMachine;
import com.hengyi.japp.mes.auto.domain.LineMachineProductPlan;
import com.hengyi.japp.mes.auto.repository.LineMachineRepository;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.ws.rs.*;
import java.security.Principal;
import java.util.List;
import java.util.Optional;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * @author jzb 2018-11-02
 */
@Singleton
@Path("api")
@Produces(APPLICATION_JSON)
public class LineMachineResource {
    private final LineMachineService lineMachineService;
    private final LineMachineRepository lineMachineRepository;

    @Inject
    private LineMachineResource(LineMachineService lineMachineService, LineMachineRepository lineMachineRepository) {
        this.lineMachineService = lineMachineService;
        this.lineMachineRepository = lineMachineRepository;
    }

    @Path("lineMachines")
    @POST
    public LineMachine create(Principal principal, LineMachineUpdateCommand command) {
        return lineMachineService.create(principal, command);
    }

    @Path("batchLineMachines")
    @POST
    public void create(Principal principal, LineMachineUpdateCommand.Batch commands) {
        commands.getCommands().forEach(command -> lineMachineService.create(principal, command));
    }

    @Path("lineMachines/{id}")
    @PUT
    public LineMachine update(Principal principal, @PathParam("id") @NotBlank String id, LineMachineUpdateCommand command) {
        return lineMachineService.update(principal, id, command);
    }

    @Path("lineMachines/{id}")
    @GET
    public Optional<LineMachine> get(@PathParam("id") @NotBlank String id) {
        return lineMachineRepository.find(id);
    }

    @Path("lineMachines/{id}/productPlan")
    @GET
    public Optional<LineMachineProductPlan> productPlan(@PathParam("id") @NotBlank String id) {
        return lineMachineRepository.find(id).map(LineMachine::getProductPlan);
    }

    @Path("lineMachines/{id}/productPlansTimeline")
    @GET
    public List<LineMachineProductPlan> timeline(@PathParam("id") @NotBlank String id,
                                                 @QueryParam("currentId") String currentId,
                                                 @QueryParam("size") @DefaultValue("50") @Min(1) int size) {
        return lineMachineService.listTimeline(id, currentId, size);
    }

}
