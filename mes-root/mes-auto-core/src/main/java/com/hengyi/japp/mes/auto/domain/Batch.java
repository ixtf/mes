package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.google.common.collect.ComparisonChain;
import com.hengyi.japp.mes.auto.interfaces.jackson.ProductEmbedSerializer;
import com.hengyi.japp.mes.auto.interfaces.jackson.WorkshopEmbedSerializer;
import lombok.*;

import javax.persistence.Cacheable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Date;

/**
 * 批号
 *
 * @author jzb 2018-06-21
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Cacheable
@Entity
public class Batch implements EntityLoggable, Comparable<Batch> {
    @ToString.Include
    @EqualsAndHashCode.Include
    @Getter
    @Setter
    @Id
    @NotBlank
    private String id;
    @JsonSerialize(using = WorkshopEmbedSerializer.class)
    @Getter
    @Setter
    @Column
    @NotNull
    private Workshop workshop;
    @JsonSerialize(using = ProductEmbedSerializer.class)
    @ToString.Include
    @Getter
    @Setter
    @Column
    @NotNull
    private Product product;
    @ToString.Include
    @Getter
    @Setter
    @Column
    @NotBlank
    private String batchNo;
    @Getter
    @Setter
    @Column
    @Min(1)
    private double silkWeight;
    @Getter
    @Setter
    @Column
    @Min(1)
    private double centralValue;
    @Getter
    @Setter
    @Column
    @Min(1)
    private int holeNum;
    /**
     * 规格
     */
    @ToString.Include
    @Getter
    @Setter
    @Column
    @NotBlank
    private String spec;
    @Getter
    @Setter
    @Column
    @NotBlank
    private String tubeColor;
    @Getter
    @Setter
    @Column
    private String note;

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

    @Override
    public int compareTo(Batch o) {
        return ComparisonChain.start()
                .compare(batchNo, o.batchNo)
                .result();
    }
}
