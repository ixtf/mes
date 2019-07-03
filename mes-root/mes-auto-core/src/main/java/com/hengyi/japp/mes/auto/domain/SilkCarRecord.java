package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.NullNode;
import com.github.ixtf.japp.core.J;
import com.github.ixtf.persistence.IEntity;
import com.hengyi.japp.mes.auto.application.event.EventSource;
import com.hengyi.japp.mes.auto.application.event.SilkCarRuntimeInitEvent;
import com.hengyi.japp.mes.auto.domain.data.DoffingType;
import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * 丝车，车次
 *
 * @author jzb 2018-06-20
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class SilkCarRecord implements IEntity {
    @ToString.Include
    @EqualsAndHashCode.Include
    @Getter
    @Setter
    @Id
    @NotBlank
    private String id;
    @ToString.Include
    @Getter
    @Setter
    @Column
    private SilkCar silkCar;
    @Getter
    @Setter
    @Column
    @NotNull
    private Batch batch;
    // 预设等级
    @Getter
    @Setter
    @Column
    @NotNull
    private Grade grade;

    @Getter
    @Setter
    @Column
    private Operator doffingOperator;
    @Getter
    @Setter
    @Column
    private DoffingType doffingType;
    @Getter
    @Setter
    @Column
    private Date doffingDateTime;

    @Getter
    @Setter
    @Column
    private Operator carpoolOperator;
    @Getter
    @Setter
    @Column
    private Date carpoolDateTime;

    @JsonIgnore
    @Getter
    @Setter
    @Column(name = "initEvent")
    private String initEventJsonString;
    @JsonIgnore
    @Getter
    @Setter
    @Column(name = "events")
    private String eventsJsonString;

    @Getter
    @Setter
    @Column
    private Date endDateTime;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private boolean deleted;

    public Date getStartDateTime() {
        return Optional.ofNullable(getDoffingDateTime()).orElse(getCarpoolDateTime());
    }

    @SneakyThrows
    @JsonGetter("initCommand")
    public JsonNode initCommand() {
        return Optional.ofNullable(getInitEventJsonString())
                .filter(J::nonBlank)
                .map(SilkCarRuntimeInitEvent.DTO::from)
                .map(SilkCarRuntimeInitEvent.DTO::getCommand)
                .orElse(null);
    }

    @SneakyThrows
    @JsonGetter("initSilks")
    public Collection<SilkRuntime> initSilks() {
        return Optional.ofNullable(getInitEventJsonString())
                .filter(J::nonBlank)
                .map(SilkCarRuntimeInitEvent.DTO::from)
                .map(SilkCarRuntimeInitEvent.DTO::getSilkRuntimes)
                .orElse(Collections.emptyList()).stream()
                .map(SilkRuntime.DTO::toSilkRuntime)
                .collect(Collectors.toList());
    }

    @SneakyThrows
    public void initEvent(EventSource initEvent) {
        final JsonNode jsonNode = Optional.ofNullable(initEvent)
                .map(EventSource::toJsonNode)
                .orElse(NullNode.getInstance());
        setInitEventJsonString(MAPPER.writeValueAsString(jsonNode));
    }

    @SneakyThrows
    public void events(Collection<EventSource> events) {
        final ArrayNode arrayNode = MAPPER.createArrayNode();
        J.emptyIfNull(events).stream().map(EventSource::toJsonNode).forEach(arrayNode::add);
        setEventsJsonString(MAPPER.writeValueAsString(arrayNode));
    }

}