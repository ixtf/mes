package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.ProductPlanNotifyExeCommand;
import com.hengyi.japp.mes.auto.application.command.ProductPlanNotifyUpdateCommand;
import com.hengyi.japp.mes.auto.domain.ProductPlanNotify;

import java.security.Principal;

/**
 * @author jzb 2018-06-21
 */
public interface ProductPlanNotifyService {

    ProductPlanNotify create(Principal principal, ProductPlanNotifyUpdateCommand command);

    ProductPlanNotify update(Principal principal, String id, ProductPlanNotifyUpdateCommand command);

    void exe(Principal principal, String id, ProductPlanNotifyExeCommand command);

    void unExe(Principal principal, String id, ProductPlanNotifyExeCommand command);

    void finish(Principal principal, String id);

    void unFinish(Principal principal, String id);
}
