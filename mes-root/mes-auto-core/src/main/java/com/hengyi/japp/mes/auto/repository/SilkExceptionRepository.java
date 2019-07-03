package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.SilkException;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;

import java.util.Optional;

/**
 * @author jzb 2018-06-25
 */
public interface SilkExceptionRepository {

    SilkException save(SilkException silkException);

    Optional<SilkException> find(String id);

    Optional<SilkException> find(EntityDTO dto);

    PublisherBuilder<SilkException> list();
}
