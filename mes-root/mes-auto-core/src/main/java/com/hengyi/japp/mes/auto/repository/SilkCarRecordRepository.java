package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.application.event.EventSource;
import com.hengyi.japp.mes.auto.application.query.SilkCarRecordQuery;
import com.hengyi.japp.mes.auto.domain.SilkCar;
import com.hengyi.japp.mes.auto.domain.SilkCarRecord;
import com.hengyi.japp.mes.auto.domain.SilkCarRuntime;
import com.hengyi.japp.mes.auto.dto.SilkCarRecordDTO;
import com.hengyi.japp.mes.auto.interfaces.riamb.event.RiambSilkDetachEvent;

import java.util.Optional;
import java.util.concurrent.CompletionStage;

/**
 * @author jzb 2018-06-25
 */
public interface SilkCarRecordRepository {

    String EVENT_SOURCE_KEY_PREFIX = "EventSource.";

    static String redisKey(String code) {
        return "SilkCarRuntime[" + code + "]";
    }

    Optional<SilkCarRecord> find(String id);

    Optional<SilkCarRuntime> find(SilkCarRecordDTO dto);

    SilkCarRecord save(SilkCarRecord silkCarRecord);

    Optional<SilkCarRuntime> findSilkCarRuntime(String code);

    default Optional<SilkCarRuntime> findSilkCarRuntime(SilkCar silkCar) {
        return Optional.ofNullable(silkCar)
                .map(SilkCar::getCode)
                .flatMap(this::findSilkCarRuntime);
    }

    CompletionStage<SilkCarRecordQuery.Result> query(SilkCarRecordQuery query);

//    CompletionStage<List<SilkCarRecord>> list();

//    void index(SilkCarRecord silkCarRecord);

    void delete(SilkCarRecord silkCarRecord);

    void addEventSource(SilkCarRuntime silkCarRuntime, EventSource event);

    Optional<SilkCarRuntime> findSilkCarRuntime(RiambSilkDetachEvent.SilkCarInfo silkCarInfo);
}
