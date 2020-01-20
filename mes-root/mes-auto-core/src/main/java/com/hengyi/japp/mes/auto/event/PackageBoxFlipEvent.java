package com.hengyi.japp.mes.auto.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.hengyi.japp.mes.auto.domain.PackageBoxFlip;
import com.hengyi.japp.mes.auto.dto.EntityByCodeDTO;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import com.hengyi.japp.mes.auto.dto.SilkCarRecordDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

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
public class PackageBoxFlipEvent extends EventSource {
    private PackageBoxFlip packageBoxFlip;
    private JsonNode command;

    @Override
    public EventSourceType getType() {
        return EventSourceType.PackageBoxFlipEvent;
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
        private EntityDTO packageBoxFlip;
        private JsonNode command;

        public static DTO from(JsonNode jsonNode) {
            return MAPPER.convertValue(jsonNode, DTO.class);
        }
    }

    @Data
    public static class AutoCommand implements Serializable {
        @NotNull
        private EntityByCodeDTO packageBox;
        @NotNull
        @Size(min = 1)
        private List<EntityByCodeDTO> inSilks;
        @NotNull
        @Size(min = 1)
        private List<Item> items;
    }

    @Data
    public static class WarehouseCommand implements Serializable {
        @NotNull
        private EntityByCodeDTO packageBox;
        @NotNull
        @Size(min = 1)
        private List<EntityByCodeDTO> inSilks;
        @NotNull
        @Size(min = 1)
        private List<Item> items;
    }

    @Data
    public static class Item implements Serializable {
        @NotNull
        private SilkCarRecordDTO silkCarRecord;
        @NotNull
        @Size(min = 1)
        private List<EntityDTO> silks;
    }

}
