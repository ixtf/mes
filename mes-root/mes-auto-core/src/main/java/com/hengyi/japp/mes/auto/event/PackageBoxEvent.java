package com.hengyi.japp.mes.auto.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.hengyi.japp.mes.auto.domain.PackageBox;
import com.hengyi.japp.mes.auto.domain.data.SaleType;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import com.hengyi.japp.mes.auto.dto.SilkCarRecordDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.Collection;
import java.util.Date;
import java.util.Set;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2018-07-28
 */
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class PackageBoxEvent extends EventSource {
    private PackageBox packageBox;
    private JsonNode command;

    @Override
    public EventSourceType getType() {
        return EventSourceType.PackageBoxEvent;
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
        private EntityDTO packageBox;
        private JsonNode command;

        public static DTO from(JsonNode jsonNode) {
            return MAPPER.convertValue(jsonNode, DTO.class);
        }
    }

    @Data
    public static class ManualCommand implements Serializable {
        @NotNull
        @Size(min = 1)
        private Collection<Item> items;

        @Data
        public static class Item implements Serializable {
            @NotNull
            private SilkCarRecordDTO silkCarRecord;
            @Min(1)
            private int count;
        }
    }

    @Data
    public static class ManualCommandSimple implements Serializable {
        @Min(1)
        private int silkCount;
        @NotNull
        @Size(min = 1)
        private Collection<SilkCarRecordDTO> silkCarRecords;
    }

    @Data
    public static class TemporaryBoxCommand implements Serializable {
        @NotNull
        private EntityDTO temporaryBox;
        @Min(1)
        private int count;
    }

    @Data
    public static class BigSilkCarCommand implements Serializable {
        @NotNull
        @Size(min = 1)
        private Set<SilkCarRecordDTO> silkCarRecords;
        @NotNull
        private SaleType saleType;
        @NotNull
        private EntityDTO sapT001l;
        @NotNull
        private Date budat;
        @NotNull
        private EntityDTO budatClass;
        @Min(1)
        private double grossWeight;
        @Min(1)
        private double netWeight;
        private double pipeType;
    }

}
