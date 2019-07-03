package com.hengyi.japp.mes.auto.worker.persistence;

import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.DyeingResult;
import com.hengyi.japp.mes.auto.repository.DyeingResultRepository;
import lombok.extern.slf4j.Slf4j;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class DyeingResultRepositoryMongo extends MongoEntityRepository<DyeingResult> implements DyeingResultRepository {
}
