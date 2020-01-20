package com.hengyi.japp.mes.auto.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.hengyi.japp.mes.auto.dto.SilkCarRecordDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.List;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2018-07-28
 */
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class SmallPackageBoxEvent extends EventSource {
    private String batchId;
    private int pacageBoxCount;
    private int silkCount;
    private JsonNode command;

    @Override
    public EventSourceType getType() {
        return EventSourceType.SmallPackageBoxEvent;
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
        private String batchId;
        private int pacageBoxCount;
        private int silkCount;
        private JsonNode command;

        public static DTO from(JsonNode jsonNode) {
            return MAPPER.convertValue(jsonNode, DTO.class);
        }
    }

    @Data
    public static class CommandConfig implements Serializable {
        @Min(1)
        private int silkCount;
        @Min(1)
        private int packageBoxCount;

        public int silkCountSum() {
            return silkCount * packageBoxCount;
        }
    }

    @Data
    public static class BatchCommand implements Serializable {
        @Size(min = 1)
        @NotNull
        private List<SilkCarRecordDTO> silkCarRecords;
        @NotNull
        private CommandConfig config;
    }

    @Data
    public class Command implements Serializable {
        @NotNull
        private SilkCarRecordDTO silkCarRecord;
        @NotNull
        private CommandConfig config;
    }
}
