package com.hengyi.japp.mes.auto.interfaces.rest;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.ProductProcessService;
import com.hengyi.japp.mes.auto.application.command.ProductProcessUpdateCommand;
import com.hengyi.japp.mes.auto.domain.ProductProcess;
import com.hengyi.japp.mes.auto.repository.ProductProcessRepository;

import javax.validation.constraints.NotBlank;
import javax.ws.rs.*;
import java.security.Principal;
import java.util.Optional;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * @author jzb 2018-11-02
 */
@Singleton
@Path("api")
@Produces(APPLICATION_JSON)
public class ProductProcessResource {
    private final ProductProcessService productProcessService;
    private final ProductProcessRepository productProcessRepository;

    @Inject
    private ProductProcessResource(ProductProcessService productProcessService, ProductProcessRepository productProcessRepository) {
        this.productProcessService = productProcessService;
        this.productProcessRepository = productProcessRepository;
    }

    @Path("productProcesses")
    @POST
    public ProductProcess create(Principal principal, ProductProcessUpdateCommand command) {
        return productProcessService.create(principal, command);
    }

    @Path("productProcesses/{id}")
    @PUT
    public ProductProcess update(Principal principal, @PathParam("id") @NotBlank String id, ProductProcessUpdateCommand command) {
        return productProcessService.update(principal, id, command);
    }

    @Path("productProcesses/{id}")
    @GET
    public Optional<ProductProcess> get(@PathParam("id") @NotBlank String id) {
        return productProcessRepository.find(id);
    }

}
