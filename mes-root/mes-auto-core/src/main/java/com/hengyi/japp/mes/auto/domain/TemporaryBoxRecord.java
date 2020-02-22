package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hengyi.japp.mes.auto.domain.data.TemporaryBoxRecordType;
import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;
import java.util.Collection;
import java.util.Date;

/**
 * @author jzb 2018-09-18
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class TemporaryBoxRecord implements EntityLoggable {
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
    @NotNull
    private TemporaryBox temporaryBox;
    @ToString.Include
    @Getter
    @Setter
    @Column
    @NotNull
    private TemporaryBoxRecordType type;
    @Getter
    @Setter
    @Column
    private int count;

    @JsonIgnore
    @Getter
    @Setter
    @Column
    private SilkCarRecord silkCarRecord;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private Collection<Silk> silks;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private PackageBox packageBox;

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
