package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.DyeingSample;
import com.hengyi.japp.mes.auto.domain.Silk;
import com.hengyi.japp.mes.auto.dto.EntityDTO;

import java.util.Optional;

/**
 * @author jzb 2018-06-24
 */
public interface DyeingSampleRepository {

    DyeingSample save(DyeingSample dyeingSampleSilk);

    Optional<DyeingSample> find(String id);

    Optional<DyeingSample> find(EntityDTO dto);

    default Optional<DyeingSample> find(Silk silk) {
        return Optional.ofNullable(silk)
                .map(Silk::getId)
                .flatMap(this::find);
    }

    Optional<DyeingSample> findByCode(String code);

}
