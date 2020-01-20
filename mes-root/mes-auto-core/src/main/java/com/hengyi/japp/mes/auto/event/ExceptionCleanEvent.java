package com.hengyi.japp.mes.auto.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.hengyi.japp.mes.auto.domain.SilkException;
import com.hengyi.japp.mes.auto.domain.SilkRuntime;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import com.hengyi.japp.mes.auto.dto.SilkCarRecordDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.Collection;

import static com.github.ixtf.japp.core.Constant.MAPPER;


/**
 * 清除异常
 *
 * @author jzb 2018-07-28
 */
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class ExceptionCleanEvent extends EventSource {
    @NotNull
    @Size(min = 1)
    private Collection<SilkRuntime> silkRuntimes;
    @NotNull
    @Size(min = 1)
    private Collection<SilkException> silkExceptions;

    @Override
    public EventSourceType getType() {
        return EventSourceType.ExceptionCleanEvent;
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
        private Collection<SilkRuntime.DTO> silkRuntimes;
        private Collection<EntityDTO> silkExceptions;

        public static DTO from(JsonNode jsonNode) {
            return MAPPER.convertValue(jsonNode, DTO.class);
        }
    }

    @Data
    public static class Command implements Serializable {
        @NotNull
        private SilkCarRecordDTO silkCarRecord;
        @NotNull
        @Size(min = 1)
        private Collection<SilkRuntime.DTO> silkRuntimes;
        @NotNull
        @Size(min = 1)
        private Collection<EntityDTO> silkExceptions;
    }
}
