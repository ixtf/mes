package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.Workshop;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;

import java.util.Optional;

/**
 * @author jzb 2018-06-24
 */
public interface WorkshopRepository {

    Workshop save(Workshop workshop);

    Optional<Workshop> find(String id);

    Optional<Workshop> find(EntityDTO dto);

    PublisherBuilder<Workshop> list();
}
