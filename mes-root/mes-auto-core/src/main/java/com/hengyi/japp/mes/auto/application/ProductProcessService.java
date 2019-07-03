package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.ProductProcessUpdateCommand;
import com.hengyi.japp.mes.auto.domain.ProductProcess;

import java.security.Principal;

/**
 * @author jzb 2018-06-21
 */
public interface ProductProcessService {

    ProductProcess create(Principal principal, ProductProcessUpdateCommand command);

    ProductProcess update(Principal principal, String id, ProductProcessUpdateCommand command);
}
