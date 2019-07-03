package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import com.github.ixtf.japp.core.J;
import com.google.common.collect.Lists;
import io.vertx.core.json.JsonObject;
import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Objects;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2018-08-02
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class DyeingResult implements EntityLoggable {
    @ToString.Include
    @EqualsAndHashCode.Include
    @Getter
    @Setter
    @Id
    @NotBlank
    private String id;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    @NotNull
    private DyeingPrepare dyeingPrepare;
    @Getter
    @Setter
    @Column
    @NotNull
    private Silk silk;

    @ToString.Include
    @Getter
    @Setter
    @Column
    @NotNull
    private LineMachine lineMachine;
    @ToString.Include
    @Getter
    @Setter
    @Column
    @Min(1)
    private int spindle;
    @ToString.Include
    @Getter
    @Setter
    @Column
    @NotNull
    private Date dateTime;

    @Getter
    @Setter
    @Column
    private boolean hasException;
    @Getter
    @Setter
    @Column
    private Grade grade;
    @Getter
    @Setter
    @Column
    private Collection<SilkException> silkExceptions;
    @Getter
    @Setter
    @Column
    private Collection<SilkNote> silkNotes;
    @JsonIgnore
    @Getter
    @Setter
    @Column(name = "formConfig")
    private String formConfigJsonString;
    @JsonIgnore
    @Getter
    @Setter
    @Column(name = "formConfigValueData")
    private String formConfigValueDataJsonString;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private DyeingResult prev;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private DyeingResult next;

    @Getter
    @Setter
    @Column
    @NotNull
    private Operator creator;
    @Column(name = "cdt")
    @Getter
    @Setter
    @NotNull
    private Date createDateTime;
    @Getter
    @Setter
    @Column
    private Operator modifier;
    @Getter
    @Setter
    @Column(name = "mdt")
    private Date modifyDateTime;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private boolean deleted;

    public boolean isSubmitted() {
        return getDyeingPrepare().isSubmitted();
    }

    @JsonIgnore
    public boolean isFirst() {
        return getDyeingPrepare().isFirst();
    }

    @JsonIgnore
    public boolean isCross() {
        return getDyeingPrepare().isCross();
    }

    @JsonIgnore
    public boolean isMulti() {
        return getDyeingPrepare().isMulti();
    }

    @JsonGetter("formConfig")
    public JsonNode formConfig() throws IOException {
        final String jsonString = getFormConfigJsonString();
        return J.nonBlank(jsonString) ? MAPPER.readTree(jsonString) : null;
    }

    @SneakyThrows
    public void formConfig(JsonNode formConfig) {
        if (formConfig == null) {
            setFormConfigJsonString(null);
        } else {
            setFormConfigJsonString(MAPPER.writeValueAsString(formConfig));
        }
    }

    @SneakyThrows
    @JsonGetter("formConfigValueData")
    public JsonNode formConfigValueData() {
        final String jsonString = getFormConfigValueDataJsonString();
        return J.nonBlank(jsonString) ? MAPPER.readTree(jsonString) : null;
    }

    @SneakyThrows
    public void formConfigValueData(JsonNode node) {
        if (node == null) {
            setFormConfigValueDataJsonString(null);
        } else {
            setFormConfigValueDataJsonString(MAPPER.writeValueAsString(node));
        }
    }

    public JsonObject toRedisJsonObject() {
        return new JsonObject().put("id", getId())
                .put("dyeingPrepare", getDyeingPrepare().getId());
    }

    public List<DyeingResult> linkPush(DyeingResult item) {
        if (Objects.equals(this, item)) {
            return Lists.newArrayList(item);
        }
        final DyeingResult prev = getPrev();
        final DyeingResult next = getNext();

        if (prev != null && next != null) {
            if (item.getDateTime().getTime() >= prev.getDateTime().getTime() && item.getDateTime().getTime() <= getDateTime().getTime()) {
                final List<DyeingResult> result = Lists.newArrayList(this, prev, item);
                item.setNext(this);
                item.setPrev(prev);
                prev.setNext(item);
                setPrev(item);
                return result;
            }
        }

        if (prev == null && next == null) {
            if (item.getDateTime().getTime() >= getDateTime().getTime()) {
                setNext(item);
                item.setPrev(this);
            } else {
                setPrev(item);
                item.setNext(this);
            }
            return Lists.newArrayList(this, item);
        }

        if (item.getDateTime().getTime() >= getDateTime().getTime()) {
            if (next == null) {
                setNext(item);
                item.setPrev(this);
                return Lists.newArrayList(this, item);
            } else {
                return next.linkPush(item);
            }
        } else {
            if (prev == null) {
                setPrev(item);
                item.setNext(this);
                return Lists.newArrayList(this, item);
            } else {
                return prev.linkPush(item);
            }
        }
    }

    public SilkRuntime fillData(SilkRuntime silkRuntime) {
        final Silk silk = silkRuntime.getSilk();
        if (silk.getDoffingDateTime().getTime() >= getDateTime().getTime()) {
            silkRuntime.getDyeingResultCalcModel().add(this);
            return silkRuntime;
        }
        final DyeingResult prev = getPrev();
        if (prev != null) {
            return prev.fillData(silkRuntime);
        }
        return silkRuntime;
    }

}
