package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.LineUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Line;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
public interface LineService {

    Line create(Principal principal, LineUpdateCommand command);

    Line update(Principal principal, String id, LineUpdateCommand command);

}
