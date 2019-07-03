package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.SilkExceptionUpdateCommand;
import com.hengyi.japp.mes.auto.domain.SilkException;

import java.security.Principal;

/**
 * @author jzb 2018-06-21
 */
public interface SilkExceptionService {

    SilkException create(Principal principal, SilkExceptionUpdateCommand command);

    SilkException update(Principal principal, String id, SilkExceptionUpdateCommand command);
}
