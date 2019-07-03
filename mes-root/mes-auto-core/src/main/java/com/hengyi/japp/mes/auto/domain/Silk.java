package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.ixtf.persistence.IEntity;
import com.hengyi.japp.mes.auto.domain.data.DoffingType;
import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Collection;
import java.util.Date;

/**
 * @author jzb 2018-07-29
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class Silk implements IEntity {
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
    @Column(unique = true)
    @NotBlank
    private String code;
    /**
     * 落次
     */
    @ToString.Include
    @Getter
    @Setter
    @Column
    private String doffingNum;
    @Getter
    @Setter
    @Column
    @NotNull
    private Operator doffingOperator;
    @Getter
    @Setter
    @Column
    @NotNull
    private DoffingType doffingType;
    @Getter
    @Setter
    @Column
    @NotNull
    private Date doffingDateTime;
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
    @NotNull
    private int spindle;
    @Getter
    @Setter
    @Column
    @NotNull
    private Batch batch;
    @Getter
    @Setter
    @Column
    @NotNull
    private Grade grade;
    /**
     * 外观确认的最终异常
     */
    @Getter
    @Setter
    @Column
    private SilkException exception;
    @Getter
    @Setter
    @Column
    private Collection<SilkException> exceptions;
    @Getter
    @Setter
    @Column
    private Collection<String> dyeingExceptionStrings;

    /**
     * 是否是染判标样丝，
     * 标样丝，不计入产量
     */
    @Getter
    @Setter
    @Column
    private boolean dyeingSample;
    @Getter
    @Setter
    @Column
    private boolean detached;

    /**
     * 丝锭经历过的车次
     */
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private Collection<SilkCarRecord> silkCarRecords;

    @JsonIgnore
    @Getter
    @Setter
    @Column
    private TemporaryBox temporaryBox;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private PackageBox packageBox;
    @Getter
    @Setter
    @Column
    private Date packageDateTime;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private boolean deleted;

}
