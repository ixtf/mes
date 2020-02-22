package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.ixtf.persistence.IEntity;
import lombok.*;

import javax.persistence.Cacheable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;

/**
 * @author jzb 2018-11-11
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Cacheable
@Entity
public class SapT001l implements IEntity {
    @ToString.Include
    @EqualsAndHashCode.Include
    @Getter
    @Setter
    @Id
    private String id;
    @Getter
    @Setter
    @Column
    private String lgort;
    @Getter
    @Setter
    @Column
    private String lgobe;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private boolean deleted;
}
