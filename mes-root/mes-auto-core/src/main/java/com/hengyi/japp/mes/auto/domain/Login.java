package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.ixtf.persistence.IEntity;
import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * @author jzb 2018-06-22
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class Login implements IEntity {
    @ToString.Include
    @EqualsAndHashCode.Include
    @Getter
    @Setter
    @Id
    private String id;
    @ToString.Include
    @JsonIgnore
    @Getter
    @Setter
    @Column
    @NotNull
    private Operator operator;
    @ToString.Include
    @JsonIgnore
    @Getter
    @Setter
    @Column(unique = true)
    @NotBlank
    private String loginId;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    @NotBlank
    private String password;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private boolean deleted;
}
