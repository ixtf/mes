package com.hengyi.japp.mes.auto.api;

import javax.validation.constraints.NotBlank;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;

/**
 * @author jzb 2019-04-26
 */
@Path("")
public interface TestResource {
    @GET
    void test(@QueryParam("test") @NotBlank String test);
}
