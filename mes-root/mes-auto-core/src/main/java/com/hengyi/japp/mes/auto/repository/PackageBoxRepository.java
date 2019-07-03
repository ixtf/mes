package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.application.query.PackageBoxQuery;
import com.hengyi.japp.mes.auto.application.query.PackageBoxQueryForMeasure;
import com.hengyi.japp.mes.auto.domain.PackageBox;
import com.hengyi.japp.mes.auto.dto.EntityByCodeDTO;
import com.hengyi.japp.mes.auto.dto.EntityDTO;

import java.util.Optional;
import java.util.concurrent.CompletionStage;

/**
 * @author jzb 2018-06-24
 */
public interface PackageBoxRepository {

    PackageBox save(PackageBox packageBox);

    Optional<PackageBox> find(String id);

    Optional<PackageBox> find(EntityDTO dto);

    Optional<PackageBox> findByCode(String code);

    default Optional<PackageBox> findByCode(EntityByCodeDTO dto) {
        return Optional.ofNullable(dto)
                .map(EntityByCodeDTO::getCode)
                .flatMap(this::findByCode);
    }

    CompletionStage<PackageBoxQuery.Result> query(PackageBoxQuery packageBoxQuery);

    CompletionStage<PackageBoxQueryForMeasure.Result> query(PackageBoxQueryForMeasure packageBoxQuery);
}
