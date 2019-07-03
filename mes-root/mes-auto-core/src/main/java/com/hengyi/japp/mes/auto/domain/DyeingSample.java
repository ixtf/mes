package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Date;

/**
 * 表样丝
 *
 * @author jzb 2018-07-29
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class DyeingSample implements EntityLoggable {
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
    private Silk silk;
    @ToString.Include
    @Getter
    @Setter
    @Column
    private String code;
    @Getter
    @Setter
    @Column
    private String lineName;
    @Getter
    @Setter
    @Column
    private int lineMachineItem;
    @Getter
    @Setter
    @Column
    private int spindle;
    @Getter
    @Setter
    @Column
    private String batchNo;
    @Getter
    @Setter
    @Column
    private String doffingNum;
    @Getter
    @Setter
    @Column
    private boolean used;

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
