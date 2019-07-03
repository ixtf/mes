package com.hengyi.japp.mes.auto.worker.persistence;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.TemporaryBox;
import com.hengyi.japp.mes.auto.domain.TemporaryBoxRecord;
import com.hengyi.japp.mes.auto.repository.TemporaryBoxRecordRepository;
import com.hengyi.japp.mes.auto.repository.TemporaryBoxRepository;
import lombok.extern.slf4j.Slf4j;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class TemporaryBoxRecordRepositoryMongo extends MongoEntityRepository<TemporaryBoxRecord> implements TemporaryBoxRecordRepository {
    private final TemporaryBoxRepository temporaryBoxRepository;

    @Inject
    private TemporaryBoxRecordRepositoryMongo(TemporaryBoxRepository temporaryBoxRepository) {
        this.temporaryBoxRepository = temporaryBoxRepository;
    }

    @Override
    public TemporaryBoxRecord save(TemporaryBoxRecord temporaryBoxRecord) {
        final TemporaryBoxRecord result = super.save(temporaryBoxRecord);
        final TemporaryBox temporaryBox = result.getTemporaryBox();
        temporaryBoxRepository.rxInc(temporaryBox, temporaryBoxRecord.getCount());
        return result;
    }
}
