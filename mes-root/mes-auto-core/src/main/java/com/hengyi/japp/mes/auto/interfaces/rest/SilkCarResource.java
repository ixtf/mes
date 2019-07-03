package com.hengyi.japp.mes.auto.interfaces.rest;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.SilkCarService;
import com.hengyi.japp.mes.auto.application.command.SilkCarUpdateCommand;
import com.hengyi.japp.mes.auto.application.query.SilkCarQuery;
import com.hengyi.japp.mes.auto.domain.SilkCar;
import com.hengyi.japp.mes.auto.repository.SilkCarRepository;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.ws.rs.*;
import java.security.Principal;
import java.util.Optional;
import java.util.concurrent.CompletionStage;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * @author jzb 2018-11-02
 */
@Singleton
@Path("api")
@Produces(APPLICATION_JSON)
public class SilkCarResource {
    private final SilkCarService silkCarService;
    private final SilkCarRepository silkCarRepository;

    @Inject
    private SilkCarResource(SilkCarService silkCarService, SilkCarRepository silkCarRepository) {
        this.silkCarService = silkCarService;
        this.silkCarRepository = silkCarRepository;
    }

    @Path("silkCars")
    @POST
    public SilkCar create(Principal principal, SilkCarUpdateCommand command) {
        return silkCarService.create(principal, command);
    }

    @Path("batchSilkCars")
    @POST
    public void create(Principal principal, SilkCarUpdateCommand.Batch commands) {
        commands.getCommands().forEach(command -> silkCarService.create(principal, command));
    }

    @Path("silkCars/{id}")
    @PUT
    public SilkCar update(Principal principal, @PathParam("id") @NotBlank String id, SilkCarUpdateCommand command) {
        return silkCarService.update(principal, id, command);
    }

    @Path("silkCars/{id}")
    @GET
    public Optional<SilkCar> get(@PathParam("id") @NotBlank String id) {
        return silkCarRepository.find(id);
    }

    @Path("silkCarCodes/{code}")
    @GET
    public Optional<SilkCar> code(@PathParam("code") @NotBlank String code) {
        return silkCarRepository.findByCode(code);
    }

    @Path("silkCars")
    @GET
    public CompletionStage<SilkCarQuery.Result> query(@QueryParam("first") @DefaultValue("0") @Min(0) int first,
                                                      @QueryParam("pageSize") @DefaultValue("50") @Min(1) int pageSize,
                                                      @QueryParam("q") String q) {
        final SilkCarQuery silkCarQuery = SilkCarQuery.builder()
                .first(first)
                .pageSize(pageSize)
                .q(q)
                .build();
        return silkCarRepository.query(silkCarQuery);
    }
}
