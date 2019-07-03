package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.SapT001l;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;

import java.util.Optional;

/**
 * @author jzb 2018-11-11
 */
public interface SapT001lRepository {

    SapT001l save(SapT001l sapT001l);

    Optional<SapT001l> find(String lgort);

    Optional<SapT001l> find(EntityDTO dto);

    PublisherBuilder<SapT001l> list();

}
