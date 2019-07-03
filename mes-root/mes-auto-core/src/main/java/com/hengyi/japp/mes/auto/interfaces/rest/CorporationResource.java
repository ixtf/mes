package com.hengyi.japp.mes.auto.interfaces.rest;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.Corporation;
import com.hengyi.japp.mes.auto.repository.CorporationRepository;

import javax.validation.constraints.NotBlank;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
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
public class CorporationResource {
    private final CorporationRepository corporationRepository;

    @Inject
    private CorporationResource(CorporationRepository corporationRepository) {
        this.corporationRepository = corporationRepository;
    }

    @Path("corporations/{id}")
    @GET
    public Optional<Corporation> get(@PathParam("id") @NotBlank String id) {
        return corporationRepository.find(id);
    }

    @Path("corporations")
    @GET
    public CompletionStage<List<Corporation>> list() {
        return corporationRepository.list().toList().run();
    }
}
