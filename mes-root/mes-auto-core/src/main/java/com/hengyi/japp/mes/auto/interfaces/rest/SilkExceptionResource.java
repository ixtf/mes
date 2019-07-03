package com.hengyi.japp.mes.auto.interfaces.rest;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.SilkExceptionService;
import com.hengyi.japp.mes.auto.application.command.SilkExceptionUpdateCommand;
import com.hengyi.japp.mes.auto.domain.SilkException;
import com.hengyi.japp.mes.auto.repository.SilkExceptionRepository;

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
public class SilkExceptionResource {
    private final SilkExceptionService silkExceptionService;
    private final SilkExceptionRepository silkExceptionRepository;

    @Inject
    private SilkExceptionResource(SilkExceptionService silkExceptionService, SilkExceptionRepository silkExceptionRepository) {
        this.silkExceptionService = silkExceptionService;
        this.silkExceptionRepository = silkExceptionRepository;
    }

    @Path("silkExceptions")
    @POST
    public SilkException create(Principal principal, SilkExceptionUpdateCommand command) {
        return silkExceptionService.create(principal, command);
    }

    @Path("silkExceptions/{id}")
    @PUT
    public SilkException update(Principal principal, @PathParam("id") @NotBlank String id, SilkExceptionUpdateCommand command) {
        return silkExceptionService.update(principal, id, command);
    }

    @Path("silkExceptions/{id}")
    @GET
    public Optional<SilkException> get(@PathParam("id") @NotBlank String id) {
        return silkExceptionRepository.find(id);
    }

    @Path("silkExceptions")
    @GET
    public CompletionStage<List<SilkException>> list() {
        return silkExceptionRepository.list().toList().run();
    }
}
