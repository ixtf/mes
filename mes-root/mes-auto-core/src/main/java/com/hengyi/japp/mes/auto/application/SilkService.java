package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.SilkInspectionExceptionUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Silk;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
public interface SilkService {
    Silk update(Principal principal, String id, SilkInspectionExceptionUpdateCommand command);
}
