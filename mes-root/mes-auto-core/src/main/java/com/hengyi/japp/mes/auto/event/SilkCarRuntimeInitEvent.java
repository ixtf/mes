package com.hengyi.japp.mes.auto.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.hengyi.japp.mes.auto.domain.Grade;
import com.hengyi.japp.mes.auto.domain.SilkCar;
import com.hengyi.japp.mes.auto.domain.SilkRuntime;
import com.hengyi.japp.mes.auto.domain.data.SilkCarPosition;
import com.hengyi.japp.mes.auto.domain.data.SilkCarSideType;
import com.hengyi.japp.mes.auto.dto.CheckSilkDTO;
import com.hengyi.japp.mes.auto.dto.EntityByCodeDTO;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.SneakyThrows;
import lombok.ToString;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.Collection;
import java.util.Date;
import java.util.List;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2018-06-21
 */
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class SilkCarRuntimeInitEvent extends EventSource {
    private SilkCar silkCar;
    private Grade grade;
    private Collection<SilkRuntime> silkRuntimes;
    private JsonNode command;

    @Override
    public EventSourceType getType() {
        return EventSourceType.SilkCarRuntimeInitEvent;
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
        private EntityDTO silkCar;
        private EntityDTO grade;
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
    public static class BigSilkCarDoffingCommand implements Serializable {
        @NotNull
        private EntityByCodeDTO silkCar;
        @NotNull
        private EntityDTO grade;
        @Min(1)
        private float lineMachineCount;
        @NotNull
        @Size(min = 1)
        private List<EntityByCodeDTO> checkSilks;
    }

    @Data
    public static class RuiguanAutoDoffingCommand implements Serializable {
        private String id;
        private String line;
        private String principalName;
        private Date createDateTime;
        private SilkCarInfo silkCarInfo;
        private Collection<SilkInfo> silkInfos;

        /**
         * @author jzb 2019-03-09
         */
        @Data
        public static class SilkCarInfo implements Serializable {
            private String code;
            private int row;
            private int col;
            private String batchNo;
            private String batchSpec;
            private String grade;
        }

        /**
         * @author jzb 2019-03-09
         */ // { "line":"C5", "lineMachine":47, "spindle":1, "timestamp":1552038447 }
        @Data
        public static class SilkInfo implements Serializable {
            private SilkCarSideType sideType;
            private int row;
            private int col;
            private String line;
            private int lineMachine;
            private int spindle;
            private long timestamp;
            private Date doffingDateTime;
        }
    }

    @Data
    public static class AutoDoffingCommand implements Serializable {
        @NotNull
        private EntityByCodeDTO silkCar;
        @NotNull
        @Size(min = 1)
        private List<AutoDoffingCommandSilk> silks;

        @Data
        @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
        public static class AutoDoffingCommandSilk extends SilkCarPosition implements Serializable {
            @NotBlank
            private EntityDTO line;
            @Min(1)
            private int lineMachineItem;
            @Min(1)
            private int spindle;
            @NotNull
            private EntityDTO grade;
            private Date doffingDateTime;
        }
    }

    @Data
    public static class AutoDoffingAdaptCheckSilksCommand implements Serializable {
        @NotNull
        private EntityByCodeDTO silkCar;
        @NotNull
        private EntityDTO workshop;
    }

    @Data
    public static class AutoDoffingAdaptCommand implements Serializable {
        @NotNull
        private EntityByCodeDTO silkCar;
        @NotNull
        private EntityDTO workshop;
        @NotNull
        private EntityDTO grade;
        @NotNull
        @Size(min = 1)
        private List<CheckSilkDTO> checkSilks;
    }

    @Data
    public static class AdminAutoDoffingAdaptCommand implements Serializable {
        @NotNull
        private EntityByCodeDTO silkCar;
        @NotNull
        private EntityDTO workshop;
        @NotNull
        private EntityDTO grade;
        @NotNull
        @Size(min = 1)
        private List<CheckSilkDTO> checkSilks;
    }

    @Data
    public static class ManualDoffingAdaptCheckSilksCommand implements Serializable {
        @NotNull
        private EntityByCodeDTO silkCar;
        @Min(1)
        private float lineMachineCount;
    }

    @Data
    public static class ManualDoffingCommand implements Serializable {
        @NotNull
        private EntityByCodeDTO silkCar;
        @Min(1)
        private float lineMachineCount;
        @NotNull
        @Size(min = 1)
        private List<CheckSilkDTO> checkSilks;
        @NotNull
        private EntityDTO grade;
    }

    @Data
    public static class AdminManualDoffingCommand implements Serializable {
        @NotNull
        private EntityByCodeDTO silkCar;
        @NotNull
        @Size(min = 1)
        private List<CheckSilkDTO> checkSilks;
        @NotNull
        private EntityDTO grade;
    }

    @Data
    public static class DyeingSampleDoffingCheckSilksCommand implements Serializable {
        @NotNull
        private EntityByCodeDTO silkCar;
        @NotNull
        private EntityDTO workshop;
    }

    @Data
    public static class DyeingSampleDoffingCommand implements Serializable {
        @NotNull
        private EntityByCodeDTO silkCar;
        @NotNull
        private EntityDTO workshop;
        @NotNull
        @Size(min = 1, max = 1)
        private List<CheckSilkDTO> checkSilks;
        @NotNull
        private EntityDTO grade;
    }

    @Data
    public static class PhysicalInfoDoffingCheckSilksCommand implements Serializable {
        @NotNull
        private EntityByCodeDTO silkCar;
        @NotNull
        private EntityDTO workshop;
    }

    @Data
    public static class PhysicalInfoDoffingCommand implements Serializable {
        @NotNull
        private EntityByCodeDTO silkCar;
        @NotNull
        private EntityDTO workshop;
        @NotNull
        @Size(min = 1, max = 1)
        private List<CheckSilkDTO> checkSilks;
        @NotNull
        private EntityDTO grade;
    }

    @Data
    public static class CarpoolCommand implements Serializable {
        @NotNull
        private EntityByCodeDTO silkCar;
        @NotNull
        @Size(min = 1)
        private List<CheckSilkDTO> checkSilks;
        @NotNull
        private EntityDTO grade;
    }

}
