package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.LineMachineProductPlan;

import java.util.Optional;

/**
 * @author jzb 2018-06-24
 */
public interface LineMachineProductPlanRepository {

    LineMachineProductPlan save(LineMachineProductPlan productPlan);

    Optional<LineMachineProductPlan> find(String id);
}
