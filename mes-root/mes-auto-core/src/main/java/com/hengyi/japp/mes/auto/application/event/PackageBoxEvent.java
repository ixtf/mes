package com.hengyi.japp.mes.auto.application.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.github.ixtf.japp.core.J;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.domain.PackageBox;
import com.hengyi.japp.mes.auto.domain.Silk;
import com.hengyi.japp.mes.auto.domain.SilkRuntime;
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
import java.util.stream.Collectors;

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
    public Collection<SilkRuntime> _calcSilkRuntimes(Collection<SilkRuntime> data) {
        final Collection<Silk> silks = J.emptyIfNull(packageBox.getSilks());
        return J.emptyIfNull(data).stream()
                .filter(it -> !silks.contains(it.getSilk()))
                .collect(Collectors.toList());
//        return Lists.newArrayList();
    }

    @Override
    protected void _undo(Operator operator) {
        // todo 打包暂时不支持撤销
        throw new IllegalAccessError();
    }

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

//        public Single<PackageBoxEvent> toEvent() {
//            final PackageBoxRepository packageBoxRepository = Jvertx.getProxy(PackageBoxRepository.class);
//
//            final PackageBoxEvent event = new PackageBoxEvent();
//            event.setCommand(command);
//            return packageBoxRepository.find(packageBox.getId()).flatMap(packageBox -> {
//                event.setPackageBox(packageBox);
//                return toEvent(event);
//            });
//        }
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

}
