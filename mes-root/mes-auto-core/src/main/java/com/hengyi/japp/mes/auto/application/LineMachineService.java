package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.LineMachineUpdateCommand;
import com.hengyi.japp.mes.auto.domain.LineMachine;
import com.hengyi.japp.mes.auto.domain.LineMachineProductPlan;

import java.security.Principal;
import java.util.List;

/**
 * @author jzb 2018-06-22
 */
public interface LineMachineService {

    LineMachine create(Principal principal, LineMachineUpdateCommand command);

    LineMachine update(Principal principal, String id, LineMachineUpdateCommand command);

    List<LineMachineProductPlan> listTimeline(String id, String currentId, int size);
}
