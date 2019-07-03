package com.hengyi.japp.mes.auto.interfaces.jikon.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.github.ixtf.japp.core.J;
import com.hengyi.japp.mes.auto.application.event.EventSource;
import com.hengyi.japp.mes.auto.application.event.EventSourceType;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.domain.SilkRuntime;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import javax.validation.constraints.NotBlank;
import java.io.Serializable;
import java.util.Arrays;
import java.util.Collection;
import java.util.Optional;

import static com.github.ixtf.japp.core.Constant.MAPPER;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

/**
 * 丝锭解绑
 *
 * @author jzb 2018-07-28
 */
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class JikonAdapterSilkDetachEvent extends EventSource {
    private JsonNode command;

    @Override
    protected Collection<SilkRuntime> _calcSilkRuntimes(Collection<SilkRuntime> data) {
        final Collection<String> codes = Optional.ofNullable(command.get("spindleCode").asText(null))
                .filter(J::nonBlank)
                .stream()
                .map(it -> J.split(it, ","))
                .flatMap(Arrays::stream)
                .collect(toSet());
        return J.emptyIfNull(data).stream()
                .filter(it -> !codes.contains(it.getSilk().getCode()))
                .collect(toList());
    }

    @Override
    protected void _undo(Operator operator) {
        throw new IllegalAccessError();
    }

    @Override
    public EventSourceType getType() {
        return EventSourceType.JikonAdapterSilkDetachEvent;
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
        private JsonNode command;

        public static DTO from(JsonNode jsonNode) {
            return MAPPER.convertValue(jsonNode, DTO.class);
        }

//        public Single<JikonAdapterSilkDetachEvent> toEvent() {
//            final JikonAdapterSilkDetachEvent event = new JikonAdapterSilkDetachEvent();
//            event.setCommand(command);
//            return toEvent(event);
//        }
    }

    /**
     * @author jzb 2018-11-07
     */
    @Data
    public static class Command implements Serializable {
        @NotBlank
        private String silkcarCode;
        /**
         * 丝锭条码
         * （,）逗号分割
         */
        private String spindleCode;
    }
}
