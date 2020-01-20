package com.hengyi.japp.mes.auto.report.application.dto.silk_car_record;

import com.hengyi.japp.mes.auto.event.EventSource;
import com.hengyi.japp.mes.auto.domain.data.SilkCarRecordAggregateType;
import com.hengyi.japp.mes.auto.report.application.RedisService;
import org.bson.Document;

import java.util.Collection;
import java.util.Map;

import static java.util.stream.Collectors.toList;

/**
 * @author jzb 2019-07-11
 */
public class SilkCarRecordAggregate_Runtime extends SilkCarRecordAggregate {
    String EVENT_SOURCE_KEY_PREFIX = "EventSource.";

    static String redisKey(String code) {
        return "SilkCarRuntime[" + code + "]";
    }

    protected SilkCarRecordAggregate_Runtime(Document document) {
        super(document);
    }

    @Override
    protected Collection<EventSource.DTO> fetchEventSources() {
        final String code = silkCar.getString("code");
        final String redisKey = redisKey(code);
        final Map<String, String> redisMap = RedisService.call(jedis -> jedis.hgetAll(redisKey));
        return redisMap.keySet().parallelStream()
                .filter(it -> it.startsWith(EVENT_SOURCE_KEY_PREFIX))
                .map(redisMap::get)
                .map(this::toEventSource)
                .collect(toList());
    }

    @Override
    public SilkCarRecordAggregateType getType() {
        return SilkCarRecordAggregateType.RUNTIME;
    }

}
