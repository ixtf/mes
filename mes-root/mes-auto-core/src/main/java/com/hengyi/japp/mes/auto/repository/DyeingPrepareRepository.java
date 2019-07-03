package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.application.query.DyeingPrepareQuery;
import com.hengyi.japp.mes.auto.application.query.DyeingPrepareResultQuery;
import com.hengyi.japp.mes.auto.domain.DyeingPrepare;
import com.hengyi.japp.mes.auto.dto.EntityDTO;

import java.util.Optional;
import java.util.concurrent.CompletionStage;

/**
 * @author jzb 2018-06-24
 */
public interface DyeingPrepareRepository {

    DyeingPrepare save(DyeingPrepare dyeingPrepare);

    Optional<DyeingPrepare> find(String id);

    Optional<DyeingPrepare> find(EntityDTO dto);

    CompletionStage<DyeingPrepareQuery.Result> query(DyeingPrepareQuery dyeingPrepareQuery);

    CompletionStage<DyeingPrepareResultQuery.Result> query(DyeingPrepareResultQuery dyeingPrepareResultQuery);
}
