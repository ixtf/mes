package com.hengyi.japp.mes.auto.interfaces.rest;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.AdminService;
import com.hengyi.japp.mes.auto.application.event.SilkCarRuntimeInitEvent;
import com.hengyi.japp.mes.auto.domain.SilkCarRuntime;

import javax.ws.rs.*;
import java.security.Principal;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * @author jzb 2019-01-08
 */
@Singleton
@Path("api/admin")
@Consumes(APPLICATION_JSON)
@Produces(APPLICATION_JSON)
public class AdminResource {
    private final AdminService adminService;

    @Inject
    private AdminResource(AdminService adminService) {
        this.adminService = adminService;
    }

    @Path("ManualDoffingEvents")
    @POST
    public SilkCarRuntime handle(Principal principal, SilkCarRuntimeInitEvent.AdminManualDoffingCommand command) {
        return adminService.handle(principal, command);
    }

    @Path("silkCarRecords/{id}")
    @DELETE
    public void handle(Principal principal, @PathParam("id") String id) {
        adminService.deleteSilkCarRecord(principal, id);
    }

}
