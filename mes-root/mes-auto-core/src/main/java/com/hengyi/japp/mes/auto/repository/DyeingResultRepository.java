package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.DyeingResult;

import java.util.Optional;

/**
 * @author jzb 2018-06-24
 */
public interface DyeingResultRepository {

    DyeingResult save(DyeingResult dyeingResult);

    Optional<DyeingResult> find(String id);

}
