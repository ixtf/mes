package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.application.query.BatchQuery;
import com.hengyi.japp.mes.auto.domain.Batch;
import com.hengyi.japp.mes.auto.dto.EntityDTO;

import java.util.Optional;
import java.util.concurrent.CompletionStage;

/**
 * @author jzb 2018-06-24
 */
public interface BatchRepository {

    Batch save(Batch batch);

    Optional<Batch> find(String id);

    Optional<Batch> find(EntityDTO dto);

    Optional<Batch> findByBatchNo(String batchNo);

    CompletionStage<BatchQuery.Result> query(BatchQuery query);
}
