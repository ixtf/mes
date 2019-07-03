package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.application.query.SilkQuery;
import com.hengyi.japp.mes.auto.domain.Silk;
import com.hengyi.japp.mes.auto.dto.EntityByCodeDTO;

import java.util.Optional;
import java.util.concurrent.CompletionStage;

/**
 * @author jzb 2018-06-24
 */
public interface SilkRepository {

    Silk save(Silk silk);

    Optional<Silk> find(String id);

    Optional<Silk> findByCode(String code);

    default Optional<Silk> find(EntityByCodeDTO dto) {
        return Optional.ofNullable(dto)
                .map(EntityByCodeDTO::getCode)
                .flatMap(this::findByCode);
    }

    CompletionStage<SilkQuery.Result> query(SilkQuery silkQuery);

}
