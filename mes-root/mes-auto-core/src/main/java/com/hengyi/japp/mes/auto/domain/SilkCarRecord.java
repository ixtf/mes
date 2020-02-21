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
import java.util.Date;
import java.util.Optional;

/**
 * 丝车，车次
 *
 * @author jzb 2018-06-20
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
//@EntityListeners()
public class SilkCarRecord implements IEntity {
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
    private SilkCar silkCar;
    @Getter
    @Setter
    @Column
    @NotNull
    private Batch batch;
    // 预设等级
    @Getter
    @Setter
    @Column
    @NotNull
    private Grade grade;

    @Getter
    @Setter
    @Column
    private Operator doffingOperator;
    @Getter
    @Setter
    @Column
    private DoffingType doffingType;
    @Getter
    @Setter
    @Column
    private Date doffingDateTime;

    @Getter
    @Setter
    @Column
    private Operator carpoolOperator;
    @Getter
    @Setter
    @Column
    private Date carpoolDateTime;

    @JsonIgnore
    @Getter
    @Setter
    @Column(name = "initEvent")
    private String initEventJsonString;
    @JsonIgnore
    @Getter
    @Setter
    @Column(name = "events")
    private String eventsJsonString;

    @Getter
    @Setter
    @Column
    private Date endDateTime;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private boolean deleted;

    public Date getStartDateTime() {
        return Optional.ofNullable(getDoffingDateTime()).orElse(getCarpoolDateTime());
    }

}