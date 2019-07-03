package com.hengyi.japp.mes.auto.interfaces.rest;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.SilkNoteService;
import com.hengyi.japp.mes.auto.application.command.SilkNoteUpdateCommand;
import com.hengyi.japp.mes.auto.domain.SilkNote;
import com.hengyi.japp.mes.auto.repository.SilkNoteRepository;

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
public class SilkNoteResource {
    private final SilkNoteService silkNoteService;
    private final SilkNoteRepository silkNoteRepository;

    @Inject
    private SilkNoteResource(SilkNoteService silkNoteService, SilkNoteRepository silkNoteRepository) {
        this.silkNoteService = silkNoteService;
        this.silkNoteRepository = silkNoteRepository;
    }

    @Path("silkNotes")
    @POST
    public SilkNote create(Principal principal, SilkNoteUpdateCommand command) {
        return silkNoteService.create(principal, command);
    }

    @Path("silkNotes/{id}")
    @PUT
    public SilkNote update(Principal principal, @PathParam("id") @NotBlank String id, SilkNoteUpdateCommand command) {
        return silkNoteService.update(principal, id, command);
    }

    @Path("silkNotes/{id}")
    @GET
    public Optional<SilkNote> get(@PathParam("id") @NotBlank String id) {
        return silkNoteRepository.find(id);
    }

    @Path("silkNotes")
    @GET
    public CompletionStage<List<SilkNote>> list() {
        return silkNoteRepository.list().toList().run();
    }
}
