package com.hengyi.japp.mes.auto.search.interfaces.rest;

import reactor.core.publisher.Mono;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

/**
 * @author jzb 2019-11-12
 */
@Path("search")
public class SearchResource {
    @Path("packageBoxes")
    @GET
    public Mono<String> search() {
        return Mono.just("");
    }
}
