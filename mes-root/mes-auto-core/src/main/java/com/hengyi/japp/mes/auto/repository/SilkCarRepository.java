package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.application.query.SilkCarQuery;
import com.hengyi.japp.mes.auto.domain.SilkCar;
import com.hengyi.japp.mes.auto.dto.EntityByCodeDTO;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;

import java.util.Optional;
import java.util.concurrent.CompletionStage;

/**
 * @author jzb 2018-06-24
 */
public interface SilkCarRepository {

    Optional<SilkCar> find(String id);

    Optional<SilkCar> find(EntityDTO dto);

    Optional<SilkCar> findByCode(String code);

    default Optional<SilkCar> findByCode(EntityByCodeDTO dto) {
        return Optional.ofNullable(dto)
                .map(EntityByCodeDTO::getCode)
                .flatMap(this::findByCode);
    }

    SilkCar save(SilkCar silkCar);

    PublisherBuilder<SilkCar> autoComplete(String q);

    CompletionStage<SilkCarQuery.Result> query(SilkCarQuery silkCarQuery);
}
