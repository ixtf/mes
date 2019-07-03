package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.SilkCarUpdateCommand;
import com.hengyi.japp.mes.auto.domain.SilkCar;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
public interface SilkCarService {

    SilkCar create(Principal principal, SilkCarUpdateCommand command);

    SilkCar update(Principal principal, String id, SilkCarUpdateCommand command);
}
