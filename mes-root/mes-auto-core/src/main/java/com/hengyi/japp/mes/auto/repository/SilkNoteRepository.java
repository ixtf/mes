package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.SilkNote;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;

import java.util.Optional;

/**
 * @author jzb 2018-06-25
 */
public interface SilkNoteRepository {

    SilkNote save(SilkNote silkNote);

    Optional<SilkNote> find(String id);

    Optional<SilkNote> find(EntityDTO dto);

    PublisherBuilder<SilkNote> list();
}
