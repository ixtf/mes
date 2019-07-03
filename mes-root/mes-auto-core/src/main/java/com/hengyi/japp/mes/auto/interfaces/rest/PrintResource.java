package com.hengyi.japp.mes.auto.interfaces.rest;

import com.github.ixtf.japp.core.J;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.SilkBarcodeService;
import com.hengyi.japp.mes.auto.application.command.PrintCommand;
import com.hengyi.japp.mes.auto.domain.data.MesAutoPrinter;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * @author jzb 2018-11-02
 */
@Singleton
@Path("api")
@Produces(APPLICATION_JSON)
public class PrintResource {
    private final JedisPool jedisPool;
    private final SilkBarcodeService silkBarcodeService;

    @Inject
    private PrintResource(SilkBarcodeService silkBarcodeService, JedisPool jedisPool) {
        this.silkBarcodeService = silkBarcodeService;
        this.jedisPool = jedisPool;
    }

    @Path("prints/printers")
    @GET
    public List<MesAutoPrinter> get() {
        try (Jedis jedis = jedisPool.getResource()) {
            return jedis.pubsubChannels("SilkBarcodePrinter-*")
                    .parallelStream()
                    .map(it -> J.split(it, "-"))
                    .filter(it -> it.length == 3)
                    .map(split -> {
                        final String id = split[1];
                        final String name = split[2];
                        final MesAutoPrinter mesAutoPrinter = new MesAutoPrinter();
                        mesAutoPrinter.setId(id);
                        mesAutoPrinter.setName(name);
                        return mesAutoPrinter;
                    })
                    .collect(Collectors.toList());
        }
    }

    @Path("/prints/silkBarcodes/print")
    @POST
    public void print(Principal principal, PrintCommand.SilkBarcodePrintCommand command) {
        silkBarcodeService.print(principal, command);
    }

    @Path("/prints/silks/print")
    @POST
    public void print(Principal principal, PrintCommand.SilkPrintCommand command) {
        silkBarcodeService.print(principal, command);
    }

}
