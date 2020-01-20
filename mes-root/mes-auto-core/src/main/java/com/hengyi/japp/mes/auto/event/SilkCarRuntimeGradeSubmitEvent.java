package com.hengyi.japp.mes.auto.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.hengyi.japp.mes.auto.domain.Grade;
import com.hengyi.japp.mes.auto.domain.SilkRuntime;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import com.hengyi.japp.mes.auto.dto.SilkCarRecordDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Collection;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2018-07-30
 */
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class SilkCarRuntimeGradeSubmitEvent extends EventSource {
    @NotNull
    private Collection<Item> silkRuntimes;

    @Override
    public EventSourceType getType() {
        return EventSourceType.SilkCarRuntimeGradeSubmitEvent;
    }

    @Override
    public JsonNode toJsonNode() {
        final DTO dto = MAPPER.convertValue(this, DTO.class);
        return MAPPER.convertValue(dto, JsonNode.class);
    }

    @Data
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class Item extends SilkRuntime {
        private Grade grade;
    }

    @Data
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class ItemDTO extends SilkRuntime.DTO {
        @NotNull
        private EntityDTO grade;
    }

    @Data
    @ToString(onlyExplicitlyIncluded = true)
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class DTO extends EventSource.DTO {
        private Collection<ItemDTO> silkRuntimes;

        public static DTO from(JsonNode jsonNode) {
            return MAPPER.convertValue(jsonNode, DTO.class);
        }
    }

    @Data
    public static class Command implements Serializable {
        @NotNull
        private SilkCarRecordDTO silkCarRecord;
        @NotNull
        private Collection<ItemDTO> silkRuntimes;
    }

}
