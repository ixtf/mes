package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.LineMachineProductPlan;

import java.util.Optional;

/**
 * @author jzb 2018-06-25
 */
public interface ProductPlanLineMachineRepository {
    Optional<LineMachineProductPlan> find(String id);
}
