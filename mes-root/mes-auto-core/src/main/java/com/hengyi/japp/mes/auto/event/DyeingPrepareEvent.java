package com.hengyi.japp.mes.auto.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.hengyi.japp.mes.auto.domain.DyeingPrepare;
import com.hengyi.japp.mes.auto.domain.SilkRuntime;
import com.hengyi.japp.mes.auto.domain.data.DyeingType;
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
 * @author jzb 2018-06-21
 */
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class DyeingPrepareEvent extends EventSource {
    private DyeingPrepare dyeingPrepare;
    private JsonNode command;

    @Override
    public EventSourceType getType() {
        return EventSourceType.DyeingPrepareEvent;
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
        private EntityDTO dyeingPrepare;
        private JsonNode command;

        public static DTO from(JsonNode jsonNode) {
            return MAPPER.convertValue(jsonNode, DTO.class);
        }
    }

    @Data
    public static class FirstSubmitCommand implements Serializable {
        @NotNull
        protected SilkCarRecordDTO silkCarRecord;
        @NotNull
        @Size(min = 1)
        protected Collection<SilkRuntime.DTO> silkRuntimes;

        @Data
        public static class Batch implements Serializable {
            @NotNull
            @Size(min = 1)
            private Collection<FirstSubmitCommand> commands;
        }
    }

    @Data
    public static class CrossSpindleSubmitCommand implements Serializable {
        @NotNull
        protected SilkCarRecordDTO silkCarRecord;
        @NotNull
        @Size(min = 1)
        protected Collection<SilkRuntime.DTO> silkRuntimes;

        @Data
        public static class Batch implements Serializable {
            @NotNull
            @Size(min = 1)
            private Collection<CrossSpindleSubmitCommand> commands;
        }
    }

    @Data
    public static class CrossLineMachineSubmitCommand implements Serializable {
        @NotNull
        private SilkCarRecordDTO silkCarRecord1;
        @NotNull
        @Size(min = 1)
        private Collection<SilkRuntime.DTO> silkRuntimes1;
        @NotNull
        private SilkCarRecordDTO silkCarRecord2;
        @NotNull
        @Size(min = 1)
        private Collection<SilkRuntime.DTO> silkRuntimes2;
    }

    @Data
    public static class MultiSubmitCommand implements Serializable {
        @NotNull
        private SilkCarRecordDTO silkCarRecord;
        @NotNull
        @Size(min = 1)
        private Collection<SilkRuntime.DTO> silkRuntimes;
        @NotNull
        private DyeingType dyeingType;
    }

}
