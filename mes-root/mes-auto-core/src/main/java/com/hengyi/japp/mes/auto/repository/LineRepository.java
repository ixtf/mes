package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.application.query.LineQuery;
import com.hengyi.japp.mes.auto.domain.Line;
import com.hengyi.japp.mes.auto.domain.Workshop;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;

import java.util.Optional;
import java.util.concurrent.CompletionStage;

/**
 * @author jzb 2018-06-24
 */
public interface LineRepository {

    Optional<Line> find(String id);

    Optional<Line> find(EntityDTO dto);

    Optional<Line> findByName(String lineName);

    Line save(Line line);

    PublisherBuilder<Line> autoComplete(String q);

    CompletionStage<LineQuery.Result> query(LineQuery lineQuery);

    PublisherBuilder<Line> listByWorkshopId(String id);

    default PublisherBuilder<Line> listBy(Workshop workshop) {
        return listByWorkshopId(workshop.getId());
    }

    PublisherBuilder<Line> list();
}
