package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Date;

/**
 * @author jzb 2018-06-22
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class ExceptionRecord implements EntityLoggable {
    @ToString.Include
    @EqualsAndHashCode.Include
    @Getter
    @Setter
    @Id
    private String id;
    @Getter
    @Setter
    @Column
    @NotNull
    private LineMachine lineMachine;
    @Getter
    @Setter
    @Column
    @Min(1)
    private int spindle;
    @Getter
    @Setter
    @Column
    @NotBlank
    private String doffingNum;
    @Getter
    @Setter
    @Column
    @NotNull
    private SilkException exception;
    @Getter
    @Setter
    @Column
    private Silk silk;
    @Getter
    @Setter
    @Column
    private boolean handled;
    @Getter
    @Setter
    @Column
    private Operator handler;
    @Getter
    @Setter
    @Column
    private Date handleDateTime;

    @Getter
    @Setter
    @Column
    @NotNull
    private Operator creator;
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
