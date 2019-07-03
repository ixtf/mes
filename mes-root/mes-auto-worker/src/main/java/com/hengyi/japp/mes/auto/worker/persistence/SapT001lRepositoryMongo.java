package com.hengyi.japp.mes.auto.worker.persistence;

import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.SapT001l;
import com.hengyi.japp.mes.auto.repository.SapT001lRepository;
import lombok.extern.slf4j.Slf4j;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class SapT001lRepositoryMongo extends MongoEntityRepository<SapT001l> implements SapT001lRepository {

    @Override
    public SapT001l save(SapT001l sapT001l) {
        sapT001l.setId(sapT001l.getLgort());
        return super.save(sapT001l);
    }
}
