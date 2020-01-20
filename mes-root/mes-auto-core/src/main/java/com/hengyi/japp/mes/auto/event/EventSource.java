package com.hengyi.japp.mes.auto.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.bson.types.ObjectId;

import java.io.Serializable;
import java.util.Date;

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

    @ToString.Include
    public abstract EventSourceType getType();

    public abstract JsonNode toJsonNode();

    @Override
    public int compareTo(EventSource o) {
        return this.fireDateTime.compareTo(o.fireDateTime);
    }

    public void fire(Operator operator) {
        fire(operator, new Date());
    }

    public void fire(Operator operator, Date fireDateTime) {
        this.eventId = new ObjectId().toHexString();
        this.operator = operator;
        this.operator.setId(operator.getId());
        this.fireDateTime = fireDateTime;
    }

    @Data
    @ToString(onlyExplicitlyIncluded = true)
    @EqualsAndHashCode(onlyExplicitlyIncluded = true)
    public static class DTO implements Serializable, Comparable<DTO> {
        @ToString.Include
        @EqualsAndHashCode.Include
        private String eventId;
        private EventSourceType type;
        private EntityDTO operator;
        private Date fireDateTime;
        private boolean deleted;
        private EntityDTO deleteOperator;
        private Date deleteDateTime;

        @Override
        public int compareTo(DTO o) {
            return this.fireDateTime.compareTo(o.fireDateTime);
        }
    }

}
