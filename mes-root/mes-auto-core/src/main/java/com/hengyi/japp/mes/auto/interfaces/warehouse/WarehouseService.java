package com.hengyi.japp.mes.auto.interfaces.warehouse;

import com.hengyi.japp.mes.auto.application.event.PackageBoxFlipEvent;
import com.hengyi.japp.mes.auto.domain.PackageBox;
import com.hengyi.japp.mes.auto.domain.PackageBoxFlip;
import com.hengyi.japp.mes.auto.interfaces.warehouse.command.WarehousePackageBoxFetchCommand;
import com.sun.security.auth.UserPrincipal;

import java.security.Principal;

/**
 * 仓库接口
 *
 * @author jzb 2018-06-25
 */
public interface WarehouseService {
    Principal PRINCIPAL = new UserPrincipal("if_warehouse");

    PackageBox handle(Principal principal, WarehousePackageBoxFetchCommand command);

    PackageBoxFlip handle(Principal principal, PackageBoxFlipEvent.WarehouseCommand command);
}
