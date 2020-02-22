package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.ixtf.persistence.IOperator;
import com.hengyi.japp.mes.auto.domain.data.RoleType;
import lombok.*;

import javax.persistence.Cacheable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.NotBlank;
import java.util.Collection;

/**
 * @author jzb 2018-06-22
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Cacheable
@Entity
public class Operator implements IOperator {
    @ToString.Include
    @EqualsAndHashCode.Include
    @Getter
    @Setter
    @Id
    private String id;
    @ToString.Include
    @Getter
    @Setter
    @Column
    @NotBlank
    private String name;
    @Getter
    @Setter
    @Column
    private String hrId;
    @Getter
    @Setter
    @Column
    private String oaId;
    @Getter
    @Setter
    @Column
    private String phone;
    @Getter
    @Setter
    @Column
    private boolean admin;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private Collection<OperatorGroup> groups;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private Collection<RoleType> roles;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private Collection<Permission> permissions;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private boolean deleted;

}
