package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.FormConfigUpdateCommand;
import com.hengyi.japp.mes.auto.domain.FormConfig;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
public interface FormConfigService {

    FormConfig create(Principal principal, FormConfigUpdateCommand command);

    FormConfig update(Principal principal, String id, FormConfigUpdateCommand command);
}
