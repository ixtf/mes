package com.hengyi.japp.mes.auto.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.hengyi.japp.mes.auto.domain.ProductProcess;
import com.hengyi.japp.mes.auto.domain.SilkException;
import com.hengyi.japp.mes.auto.domain.SilkNote;
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
 * 工序操作数据提交
 *
 * @author jzb 2018-07-28
 */
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class ProductProcessSubmitEvent extends EventSource {
    private ProductProcess productProcess;
    private Collection<SilkRuntime> silkRuntimes;
    private Collection<SilkException> silkExceptions;
    private Collection<SilkNote> silkNotes;
    private JsonNode formConfig;
    private JsonNode formConfigValueData;

    @Override
    public EventSourceType getType() {
        return EventSourceType.ProductProcessSubmitEvent;
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
        private EntityDTO productProcess;
        private Collection<SilkRuntime.DTO> silkRuntimes;
        private Collection<EntityDTO> silkExceptions;
        private Collection<EntityDTO> silkNotes;
        private JsonNode formConfig;
        private JsonNode formConfigValueData;

        public static DTO from(JsonNode jsonNode) {
            return MAPPER.convertValue(jsonNode, DTO.class);
        }
    }

    @Data
    public static class Command implements Serializable {
        @NotNull
        private SilkCarRecordDTO silkCarRecord;
        @NotNull
        private EntityDTO productProcess;
        private Collection<SilkRuntime.DTO> silkRuntimes;
        private Collection<EntityDTO> silkExceptions;
        private Collection<EntityDTO> silkNotes;
        private JsonNode formConfig;
        private JsonNode formConfigValueData;
    }
}
