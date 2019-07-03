package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hengyi.japp.mes.auto.domain.data.ProductPlanType;
import com.hengyi.japp.mes.auto.interfaces.jackson.LineMachineEmbedSerializer;
import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Collection;
import java.util.Date;

/**
 * 生产计划改变通知
 *
 * @author jzb 2018-06-21
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class ProductPlanNotify implements EntityLoggable {
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
    @NotNull
    private ProductPlanType type;
    @ToString.Include
    @Getter
    @Setter
    @Column
    @NotBlank
    private String name;
    @Getter
    @Setter
    @Column
    @NotNull
    private Batch batch;
    @Getter
    @Setter
    @Column
    @NotNull
    private Date startDate;
    @Getter
    @Setter
    @Column
    private Date endDate;

    @JsonSerialize(contentUsing = LineMachineEmbedSerializer.class)
    @Getter
    @Setter
    @Column(name = "machines")
    @Size(min = 1)
    @NotNull
    private Collection<LineMachine> lineMachines;

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
