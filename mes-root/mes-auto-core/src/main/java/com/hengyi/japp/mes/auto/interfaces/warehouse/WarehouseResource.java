package com.hengyi.japp.mes.auto.interfaces.warehouse;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.event.PackageBoxFlipEvent;
import com.hengyi.japp.mes.auto.domain.PackageBox;
import com.hengyi.japp.mes.auto.domain.PackageBoxFlip;
import com.hengyi.japp.mes.auto.interfaces.warehouse.command.WarehousePackageBoxFetchCommand;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import static com.github.ixtf.japp.core.Constant.MAPPER;
import static com.hengyi.japp.mes.auto.interfaces.warehouse.WarehouseService.PRINCIPAL;
import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * 仓库接口
 *
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
@Path("warehouse")
@Produces(APPLICATION_JSON)
public class WarehouseResource {
    private final WarehouseService warehouseService;

    @Inject
    private WarehouseResource(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    @SneakyThrows
    @Path("PackageBoxFetchEvent")
    @POST
    public PackageBox fetch(String request) {
        final StringBuilder sb = new StringBuilder("WarehousePackageBoxFetchEvent").append(request);
        log.info(sb.toString());
        final WarehousePackageBoxFetchCommand command = MAPPER.readValue(request, WarehousePackageBoxFetchCommand.class);
        final PackageBox packageBox = warehouseService.handle(PRINCIPAL, command);
        return packageBox;
    }

    @SneakyThrows
    @Path("PackageBoxFlipEvent")
    @POST
    public PackageBoxFlip packageBoxFlipEvent(String request) {
        final StringBuilder sb = new StringBuilder("WarehousePackageBoxFlipEvent").append(request);
        log.info(sb.toString());
        final PackageBoxFlipEvent.WarehouseCommand command = MAPPER.readValue(request, PackageBoxFlipEvent.WarehouseCommand.class);
        final PackageBoxFlip packageBoxFlip = warehouseService.handle(PRINCIPAL, command);
        return packageBoxFlip;
    }
}
