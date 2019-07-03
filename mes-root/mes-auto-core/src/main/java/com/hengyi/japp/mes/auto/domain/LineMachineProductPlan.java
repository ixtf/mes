package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hengyi.japp.mes.auto.interfaces.jackson.LineMachineEmbedSerializer;
import com.hengyi.japp.mes.auto.interfaces.jackson.ProductPlanNotifyEmbedSerializer;
import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Date;

/**
 * 机台生产计划
 * 对应一个计划通知
 *
 * @author jzb 2018-06-22
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class LineMachineProductPlan implements EntityLoggable {
    @ToString.Include
    @EqualsAndHashCode.Include
    @Getter
    @Setter
    @Id
    @NotBlank
    private String id;
    @ToString.Include
    @JsonSerialize(using = ProductPlanNotifyEmbedSerializer.class)
    @Getter
    @Setter
    @Column(name = "notify")
    private ProductPlanNotify productPlanNotify;
    @ToString.Include
    @JsonSerialize(using = LineMachineEmbedSerializer.class)
    @Getter
    @Setter
    @Column(name = "machine")
    private LineMachine lineMachine;
    @ToString.Include
    @Getter
    @Setter
    @Column
    @NotNull
    private Batch batch;
    @Getter
    @Setter
    @Column
    private Date startDate;
    @Getter
    @Setter
    @Column
    private Date endDate;
    /**
     * 指向上一个计划
     */
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private LineMachineProductPlan prev;
    /**
     * 指向下一个计划
     * 可能会有提前录入计划
     */
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private LineMachineProductPlan next;

    @JsonIgnore
    @Getter
    @Setter
    @Column
    @NotNull
    private Operator creator;
    @JsonIgnore
    @Getter
    @Setter
    @Column(name = "cdt")
    @NotNull
    private Date createDateTime;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private Operator modifier;
    @JsonIgnore
    @Getter
    @Setter
    @Column(name = "mdt")
    private Date modifyDateTime;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private boolean deleted;

}
