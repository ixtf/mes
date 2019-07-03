package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.Line;
import com.hengyi.japp.mes.auto.domain.LineMachine;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;

import java.util.Optional;

/**
 * @author jzb 2018-06-24
 */
public interface LineMachineRepository {

    Optional<LineMachine> find(String id);

    Optional<LineMachine> find(EntityDTO dto);

    LineMachine save(LineMachine lineMachine);

    PublisherBuilder<LineMachine> listByLineId(String lineId);

    default PublisherBuilder<LineMachine> listBy(Line line) {
        return listByLineId(line.getId());
    }

    PublisherBuilder<LineMachine> list();

    Optional<LineMachine> find(Line it, int item);

}
