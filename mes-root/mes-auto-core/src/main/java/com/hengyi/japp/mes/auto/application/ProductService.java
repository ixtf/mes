package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.ProductDyeingInfoUpdateCommand;
import com.hengyi.japp.mes.auto.application.command.ProductUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Product;

import java.security.Principal;

/**
 * @author jzb 2018-06-21
 */
public interface ProductService {

    Product create(Principal principal, ProductUpdateCommand command);

    Product update(Principal principal, String id, ProductUpdateCommand command);

    Product update(Principal principal, String id, ProductDyeingInfoUpdateCommand command);
}
