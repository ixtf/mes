package com.hengyi.japp.mes.auto.worker.persistence;

import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.Grade;
import com.hengyi.japp.mes.auto.repository.GradeRepository;
import lombok.extern.slf4j.Slf4j;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class GradeRepositoryMongo extends MongoEntityRepository<Grade> implements GradeRepository {
}
