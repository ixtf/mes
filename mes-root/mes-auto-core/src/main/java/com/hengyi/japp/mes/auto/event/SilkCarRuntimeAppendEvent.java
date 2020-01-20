package com.hengyi.japp.mes.auto.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.hengyi.japp.mes.auto.domain.SilkRuntime;
import com.hengyi.japp.mes.auto.dto.CheckSilkDTO;
import com.hengyi.japp.mes.auto.dto.EntityByCodeDTO;
import com.hengyi.japp.mes.auto.dto.SilkCarRecordDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.SneakyThrows;
import lombok.ToString;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;

import static com.github.ixtf.japp.core.Constant.MAPPER;


/**
 * 两个半车
 *
 * @author jzb 2018-06-21
 */
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class SilkCarRuntimeAppendEvent extends EventSource {
    private Collection<SilkRuntime> silkRuntimes;
    private JsonNode command;

    @Override
    public EventSourceType getType() {
        return EventSourceType.SilkCarRuntimeAppendEvent;
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
        private JsonNode command;

        @SneakyThrows
        public static DTO from(String s) {
            return from(MAPPER.readTree(s));
        }

        public static DTO from(JsonNode jsonNode) {
            return MAPPER.convertValue(jsonNode, DTO.class);
        }
    }

    @Data
    public static class CheckSilksCommand implements Serializable {
        @NotNull
        private SilkCarRecordDTO silkCarRecord;
        @Min(1)
        private float lineMachineCount;
    }

    @Data
    public static class Command implements Serializable {
        @NotNull
        private SilkCarRecordDTO silkCarRecord;
        @Min(1)
        private float lineMachineCount;
        @NotNull
        @Size(min = 1)
        private List<CheckSilkDTO> checkSilks;
    }

    @Data
    public static class BigSilkCarDoffingAppendCommand implements Serializable {
        @NotNull
        private SilkCarRecordDTO silkCarRecord;
        @Min(1)
        private float lineMachineCount;
        @NotNull
        @Size(min = 1)
        private List<EntityByCodeDTO> checkSilks;
    }
}
