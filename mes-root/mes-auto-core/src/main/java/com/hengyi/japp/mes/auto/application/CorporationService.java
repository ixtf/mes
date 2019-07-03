package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.CorporationUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Corporation;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
public interface CorporationService {

    Corporation create(Principal principal, CorporationUpdateCommand command);

    Corporation update(Principal principal, String id, CorporationUpdateCommand command);
}
