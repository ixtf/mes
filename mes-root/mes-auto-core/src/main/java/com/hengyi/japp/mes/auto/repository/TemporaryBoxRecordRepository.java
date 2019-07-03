package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.TemporaryBoxRecord;

import java.util.Optional;

/**
 * @author jzb 2018-06-24
 */
public interface TemporaryBoxRecordRepository {

    TemporaryBoxRecord save(TemporaryBoxRecord temporaryBoxRecord);

    Optional<TemporaryBoxRecord> find(String id);

}
