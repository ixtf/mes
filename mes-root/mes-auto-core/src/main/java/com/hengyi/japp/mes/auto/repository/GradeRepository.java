package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.Grade;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;

import java.util.Optional;

/**
 * @author jzb 2018-06-24
 */
public interface GradeRepository {

    Grade save(Grade grade);

    Optional<Grade> find(String id);

    Optional<Grade> find(EntityDTO dto);

    Optional<Grade> findByName(String name);

    PublisherBuilder<Grade> list();
}
