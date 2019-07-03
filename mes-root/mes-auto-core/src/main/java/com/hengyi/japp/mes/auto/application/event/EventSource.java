package com.hengyi.japp.mes.auto.application.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.github.ixtf.japp.core.exception.JAuthorizationException;
import com.github.ixtf.persistence.mongo.Jmongo;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.domain.SilkRuntime;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.SneakyThrows;
import lombok.ToString;
import org.bson.types.ObjectId;

import java.io.File;
import java.io.Serializable;
import java.security.Principal;
import java.util.Collection;
import java.util.Date;
import java.util.Objects;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * 事件源
 *
 * @author jzb 2018-07-29
 */
@Data
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public abstract class EventSource implements Serializable, Comparable<EventSource> {
    @ToString.Include
    @EqualsAndHashCode.Include
    private String eventId;
    private Operator operator;
    private Date fireDateTime;
    private boolean deleted;
    private Operator deleteOperator;
    private Date deleteDateTime;

    public static EventSource from(JsonNode jsonNode) {
        final String type = jsonNode.get("type").asText();
        final EventSourceType eventSourceType = EventSourceType.valueOf(type);
//        return eventSourceType.from(jsonNode);
        return null;
    }

    @SneakyThrows
    public static EventSource from(File file) {
        final JsonNode jsonNode = MAPPER.readTree(file);
        return EventSource.from(jsonNode);
    }

    public Collection<SilkRuntime> calcSilkRuntimes(Collection<SilkRuntime> data) {
        if (deleted) {
            return data;
        }
        return _calcSilkRuntimes(data);
    }

    protected abstract Collection<SilkRuntime> _calcSilkRuntimes(Collection<SilkRuntime> data);

    public EventSource undo(Principal principal) {
        final Operator operator = Jmongo.findById(Operator.class, principal.getName()).get();
        return undo(operator);
    }

    @SneakyThrows
    public EventSource undo(Operator operator) {
        if (!operator.isAdmin() && !Objects.equals(this.getOperator(), operator)) {
            throw new JAuthorizationException();
        }
        _undo(operator);
        this.deleted = true;
        this.deleteOperator = operator;
        this.deleteDateTime = new Date();
        return this;
    }

    protected abstract void _undo(Operator operator);

    @ToString.Include
    public abstract EventSourceType getType();

    public abstract JsonNode toJsonNode();

    @Override
    public int compareTo(EventSource o) {
        return this.fireDateTime.compareTo(o.fireDateTime);
    }

    public void fire(Operator operator) {
        this.eventId = new ObjectId().toHexString();
        this.operator = operator;
        this.operator.setId(operator.getId());
        this.fireDateTime = new Date();
    }

    @ToString(onlyExplicitlyIncluded = true)
    @EqualsAndHashCode(onlyExplicitlyIncluded = true)
    @Data
    public static abstract class DTO implements Serializable {
        @ToString.Include
        @EqualsAndHashCode.Include
        private String eventId;
        private EventSourceType type;
        private EntityDTO operator;
        private Date fireDateTime;
        private boolean deleted;
        private EntityDTO deleteOperator;
        private Date deleteDateTime;

        protected <T extends EventSource> T toEvent(T t) {
            final Operator operator = Jmongo.findById(Operator.class, this.operator.getId()).get();
            t.setEventId(eventId);
            t.setFireDateTime(fireDateTime);
            t.setDeleted(deleted);
            t.setDeleteDateTime(deleteDateTime);
            t.setOperator(operator);
            if (deleted) {
                final Operator deleteOperator = Jmongo.findById(Operator.class, this.deleteOperator.getId()).get();
                t.setDeleteOperator(deleteOperator);
            }
            return t;
        }
    }

}
