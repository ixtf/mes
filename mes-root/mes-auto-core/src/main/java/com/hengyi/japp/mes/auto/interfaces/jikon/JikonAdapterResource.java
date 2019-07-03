package com.hengyi.japp.mes.auto.interfaces.jikon;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.interfaces.jikon.event.JikonAdapterPackageBoxEvent;
import com.hengyi.japp.mes.auto.interfaces.jikon.event.JikonAdapterSilkCarInfoFetchEvent;
import com.hengyi.japp.mes.auto.interfaces.jikon.event.JikonAdapterSilkDetachEvent;
import lombok.extern.slf4j.Slf4j;

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import static com.github.ixtf.japp.core.Constant.MAPPER;
import static com.hengyi.japp.mes.auto.interfaces.riamb.RiambService.PRINCIPAL;
import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * @author jzb 2018-11-07
 */
@Slf4j
@Singleton
@Path("")
@Produces(APPLICATION_JSON)
public class JikonAdapterResource {
    private final JikonAdapter jikonAdapter;

    @Inject
    private JikonAdapterResource(JikonAdapter jikonAdapter) {
        this.jikonAdapter = jikonAdapter;
    }

    @Path("open/automaticintegration/production/getSilkSpindleInfo")
    @POST
    public String getSilkSpindleInfo(String request) throws Exception {
        final StringBuilder sb = new StringBuilder("JikonAdapterSilkCarInfoFetchEvent").append(request);
        log.info(sb.toString());
        final JikonAdapterSilkCarInfoFetchEvent.Command command = MAPPER.readValue(request, JikonAdapterSilkCarInfoFetchEvent.Command.class);
        final String result = jikonAdapter.handle(PRINCIPAL, command);
        log.info(sb.append("\n").append(result).toString());
        return result;
    }

    @Path("open/automaticintegration/production/relieveBindSilkCar")
    @POST
    public String relieveBindSilkCar(String request) throws Exception {
        final StringBuilder sb = new StringBuilder("JikonAdapterSilkDetachEvent").append(request);
        log.info(sb.toString());
        final JikonAdapterSilkDetachEvent.Command command = MAPPER.readValue(request, JikonAdapterSilkDetachEvent.Command.class);
        final String result = jikonAdapter.handle(PRINCIPAL, command);
        log.info(sb.append("\n").append(result).toString());
        return result;
    }

    @Path("open/automaticintegration/production/getSilkBoxAndspilkInfo")
    @POST
    public String getSilkBoxAndspilkInfo(String request) throws Exception {
        final StringBuilder sb = new StringBuilder("JikonAdapterPackageBoxEvent").append(request);
        log.info(sb.toString());
        final JikonAdapterPackageBoxEvent.Command command = MAPPER.readValue(request, JikonAdapterPackageBoxEvent.Command.class);
        final String result = jikonAdapter.handle(PRINCIPAL, command);
        log.info(sb.append("\n").append(result).toString());
        return result;
    }
}
