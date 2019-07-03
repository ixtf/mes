package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.Corporation;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;

import java.util.Optional;

/**
 * @author jzb 2018-06-24
 */
public interface CorporationRepository {

    Corporation save(Corporation corporation);

    Optional<Corporation> find(String id);

    Optional<Corporation> find(EntityDTO dto);

    PublisherBuilder<Corporation> list();
}
