package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hengyi.japp.mes.auto.domain.data.RoleType;
import com.hengyi.japp.mes.auto.interfaces.jackson.ProductEmbedSerializer;
import com.hengyi.japp.mes.auto.interfaces.jackson.SilkExceptionEmbedSerializer;
import com.hengyi.japp.mes.auto.interfaces.jackson.SilkNoteEmbedSerializer;
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
 * 产品工序
 *
 * @author jzb 2018-07-03
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class ProductProcess implements EntityLoggable {
    @ToString.Include
    @EqualsAndHashCode.Include
    @Getter
    @Setter
    @Id
    @NotBlank
    private String id;
    @JsonSerialize(using = ProductEmbedSerializer.class)
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
    private String name;
    /**
     * 关联的角色
     */
    @Getter
    @Setter
    @Column(name = "roles")
    private Collection<RoleType> relateRoles;
    @Getter
    @Setter
    @Column
    private int sortBy;
    @JsonSerialize(contentUsing = SilkExceptionEmbedSerializer.class)
    @Getter
    @Setter
    @Column
    @NotNull
    @Size(min = 1)
    private Collection<SilkException> exceptions;
    @JsonSerialize(contentUsing = SilkNoteEmbedSerializer.class)
    @Getter
    @Setter
    @Column
    @NotNull
    private Collection<SilkNote> notes;
    @Getter
    @Setter
    @Column
    private FormConfig formConfig;
    @Getter
    @Setter
    @Column
    private boolean mustProcess;

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
