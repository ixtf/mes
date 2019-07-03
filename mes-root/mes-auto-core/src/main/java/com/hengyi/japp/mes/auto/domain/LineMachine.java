package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.Cacheable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Collection;
import java.util.Date;

/**
 * 机台、线位，位号
 *
 * @author jzb 2018-06-22
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Cacheable
@Entity
public class LineMachine implements EntityLoggable {
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
    private Line line;
    /**
     * 机台位号
     */
    @ToString.Include
    @Getter
    @Setter
    @Column
    @Min(1)
    private int item;
    /**
     * 锭数
     */
    @Getter
    @Setter
    @Column
    @Min(1)
    private int spindleNum;
    /**
     * 落筒的锭位顺序
     */
    @Getter
    @Setter
    @Column
    @Size(min = 1)
    @NotNull
    private Collection<Integer> spindleSeq;
    /**
     * 当前正在生产的计划
     */
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private LineMachineProductPlan productPlan;

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
