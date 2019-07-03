package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.OperatorGroup;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;

import java.util.Optional;

/**
 * @author jzb 2018-06-24
 */
public interface OperatorGroupRepository {

    Optional<OperatorGroup> find(String id);

    Optional<OperatorGroup> find(EntityDTO dto);

    OperatorGroup save(OperatorGroup operatorGroup);

    PublisherBuilder<OperatorGroup> list();
}
