package com.hengyi.japp.mes.auto.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.hengyi.japp.mes.auto.domain.TemporaryBoxRecord;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import com.hengyi.japp.mes.auto.dto.SilkCarRecordDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import javax.validation.constraints.NotNull;
import java.io.Serializable;

import static com.github.ixtf.japp.core.Constant.MAPPER;


/**
 * @author jzb 2018-06-21
 */
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class TemporaryBoxEvent extends EventSource {
    private TemporaryBoxRecord temporaryBoxRecord;
    private JsonNode command;

    @Override
    public EventSourceType getType() {
        return EventSourceType.TemporaryBoxEvent;
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
        private EntityDTO temporaryBoxRecord;
        private JsonNode command;

        public static DTO from(JsonNode jsonNode) {
            return MAPPER.convertValue(jsonNode, DTO.class);
        }
    }

    @Data
    public static class FromSilkCarRuntimeCommand implements Serializable {
        @NotNull
        private EntityDTO temporaryBox;
        @NotNull
        private SilkCarRecordDTO silkCarRecord;
    }

}
