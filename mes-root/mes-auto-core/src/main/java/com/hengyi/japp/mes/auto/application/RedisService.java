package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.domain.DyeingResult;
import com.hengyi.japp.mes.auto.domain.LineMachine;

import java.util.Optional;

/**
 * @author jzb 2019-03-01
 */
public interface RedisService {

    Optional<DyeingResult> latestDyeingResult_FIRST(LineMachine lineMachine, int spindle);

    Optional<DyeingResult> latestDyeingResult_CROSS(LineMachine lineMachine, int spindle);
}
