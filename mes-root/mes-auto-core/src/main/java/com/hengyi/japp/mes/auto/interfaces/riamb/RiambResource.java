package com.hengyi.japp.mes.auto.interfaces.riamb;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.interfaces.riamb.dto.RiambFetchSilkCarRecordResultDTO;
import com.hengyi.japp.mes.auto.interfaces.riamb.event.RiambPackageBoxEvent;
import com.hengyi.japp.mes.auto.interfaces.riamb.event.RiambSilkDetachEvent;
import lombok.extern.slf4j.Slf4j;

import javax.validation.constraints.NotBlank;
import javax.ws.rs.*;

import static com.hengyi.japp.mes.auto.interfaces.riamb.RiambService.PRINCIPAL;
import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * @author jzb 2019-02-21
 */
@Slf4j
@Singleton
@Path("riamb")
@Produces(APPLICATION_JSON)
public class RiambResource {
    private final RiambService riambService;

    @Inject
    private RiambResource(RiambService riambService) {
        this.riambService = riambService;
    }

    @Path("silkCarRecords/codes/{code}")
    @GET
    public RiambFetchSilkCarRecordResultDTO fetchSilkCarRecord(@PathParam("code") @NotBlank String code) {
        return riambService.fetchSilkCarRecord(PRINCIPAL, code);
    }

    @Path("SilkDetachEvents")
    @POST
    public void fetchSilkCarRecord(RiambSilkDetachEvent.Command command) {
        riambService.silkDetach(PRINCIPAL, command);
    }

    @Path("PackageBoxEvents")
    @POST
    public void fetchSilkCarRecord(RiambPackageBoxEvent.Command command) {
        riambService.packageBox(PRINCIPAL, command);
    }

}
