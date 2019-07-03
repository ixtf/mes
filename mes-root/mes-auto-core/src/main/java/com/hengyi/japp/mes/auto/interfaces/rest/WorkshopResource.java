package com.hengyi.japp.mes.auto.interfaces.rest;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.WorkshopService;
import com.hengyi.japp.mes.auto.application.command.WorkshopUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Line;
import com.hengyi.japp.mes.auto.domain.Workshop;
import com.hengyi.japp.mes.auto.repository.LineRepository;
import com.hengyi.japp.mes.auto.repository.WorkshopRepository;

import javax.validation.constraints.NotBlank;
import javax.ws.rs.*;
import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletionStage;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * @author jzb 2018-11-02
 */
@Singleton
@Path("api")
@Produces(APPLICATION_JSON)
public class WorkshopResource {
    private final WorkshopService workshopService;
    private final WorkshopRepository workshopRepository;
    private final LineRepository lineRepository;

    @Inject
    private WorkshopResource(WorkshopService workshopService, WorkshopRepository workshopRepository, LineRepository lineRepository) {
        this.workshopService = workshopService;
        this.workshopRepository = workshopRepository;
        this.lineRepository = lineRepository;
    }

    @Path("workshops")
    @POST
    public Workshop create(Principal principal, WorkshopUpdateCommand command) {
        return workshopService.create(principal, command);
    }

    @Path("workshops/{id}")
    @PUT
    public Workshop update(Principal principal, @PathParam("id") @NotBlank String id, WorkshopUpdateCommand command) {
        return workshopService.update(principal, id, command);
    }

    @Path("workshops/{id}")
    @GET
    public Optional<Workshop> get(@PathParam("id") @NotBlank String id) {
        return workshopRepository.find(id);
    }

    @Path("workshops/{id}/lines")
    @GET
    public CompletionStage<List<Line>> lines(@PathParam("id") @NotBlank String id) {
        return lineRepository.listByWorkshopId(id).toList().run();
    }

    @Path("workshops")
    @GET
    public CompletionStage<List<Workshop>> get() {
        return workshopRepository.list().toList().run();
    }
}
