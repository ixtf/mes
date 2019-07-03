package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.TemporaryBoxUpdateCommand;
import com.hengyi.japp.mes.auto.domain.TemporaryBox;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
public interface TemporaryBoxService {

    TemporaryBox create(Principal principal, TemporaryBoxUpdateCommand command);

    TemporaryBox update(Principal principal, String id, TemporaryBoxUpdateCommand command);

}
