package com.hengyi.japp.mes.auto.interfaces.riamb.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.hengyi.japp.mes.auto.application.event.EventSource;
import com.hengyi.japp.mes.auto.application.event.EventSourceType;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.domain.SilkRuntime;
import com.hengyi.japp.mes.auto.interfaces.riamb.dto.RiambFetchSilkCarRecordResultDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.Collection;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2018-06-21
 */
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class RiambSilkCarInfoFetchEvent extends EventSource {
    private RiambFetchSilkCarRecordResultDTO result;

    @Override
    public Collection<SilkRuntime> _calcSilkRuntimes(Collection<SilkRuntime> data) {
        return data;
    }

    @Override
    protected void _undo(Operator operator) {
        throw new IllegalAccessError();
    }

    @Override
    public EventSourceType getType() {
        return EventSourceType.RiambSilkCarInfoFetchEvent;
    }

    @Override
    public JsonNode toJsonNode() {
        final DTO dto = MAPPER.convertValue(this, DTO.class);
        return MAPPER.convertValue(dto, JsonNode.class);
    }

    @Data
    @ToString(onlyExplicitlyIncluded = true)
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class DTO extends EventSource.DTO {
        private RiambFetchSilkCarRecordResultDTO result;

        public static DTO from(JsonNode jsonNode) {
            return MAPPER.convertValue(jsonNode, DTO.class);
        }
    }

}
