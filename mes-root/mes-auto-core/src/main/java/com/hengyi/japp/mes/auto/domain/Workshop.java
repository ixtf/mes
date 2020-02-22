package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.Cacheable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Collection;
import java.util.Date;

/**
 * 车间
 *
 * @author jzb 2018-06-21
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Cacheable
@Entity
public class Workshop implements EntityLoggable {
    @ToString.Include
    @EqualsAndHashCode.Include
    @Getter
    @Setter
    @Id
    private String id;
    @Getter
    @Setter
    @Column(name = "corp")
    @NotNull
    private Corporation corporation;
    @ToString.Include
    @Getter
    @Setter
    @Column
    @NotBlank
    private String name;
    /**
     * 丝锭条码打印的编码，一位
     */
    @ToString.Include
    @Getter
    @Setter
    @Column
    @Size(min = 1, max = 1)
    @NotBlank
    private String code;
    @Getter
    @Setter
    @Column
    private String note;
    @Getter
    @Setter
    @Column
    private Collection<SapT001l> sapT001ls;
    /**
     * 外贸SAP库存地
     */
    @Getter
    @Setter
    @Column
    private Collection<SapT001l> sapT001lsForeign;
    /**
     * 塑托SAP库存地
     */
    @Getter
    @Setter
    @Column
    private Collection<SapT001l> sapT001lsPallet;

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
