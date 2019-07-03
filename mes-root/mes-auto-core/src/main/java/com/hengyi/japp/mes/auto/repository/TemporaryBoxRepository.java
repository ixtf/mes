package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.TemporaryBox;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;

import java.util.Optional;

/**
 * @author jzb 2018-06-24
 */
public interface TemporaryBoxRepository {

    TemporaryBox save(TemporaryBox temporaryBox);

    Optional<TemporaryBox> find(String id);

    Optional<TemporaryBox> find(EntityDTO entityDTO);

    Optional<TemporaryBox> findByCode(String code);

    PublisherBuilder<TemporaryBox> list();

    void rxInc(String id, int count);

    default void rxInc(TemporaryBox temporaryBox, int count) {
        rxInc(temporaryBox.getId(), count);
    }
}
