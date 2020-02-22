package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.ixtf.persistence.IEntity;
import com.google.common.collect.Lists;
import com.hengyi.japp.mes.auto.domain.data.DyeingType;
import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 待染判
 *
 * @author jzb 2018-08-02
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class DyeingPrepare implements IEntity {
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
    private DyeingType type;

    // 一次染判，位与锭交织、多次染判
    @Getter
    @Setter
    @Column
    private SilkCarRecord silkCarRecord;
    @Getter
    @Setter
    @Column
    private Collection<Silk> silks;

    // 位与位交织
    @Getter
    @Setter
    @Column
    private SilkCarRecord silkCarRecord1;
    @Getter
    @Setter
    @Column
    private Collection<Silk> silks1;
    @Getter
    @Setter
    @Column
    private SilkCarRecord silkCarRecord2;
    @Getter
    @Setter
    @Column
    private Collection<Silk> silks2;

    @Getter
    @Setter
    @Column
    private Collection<DyeingResult> dyeingResults;

    @Getter
    @Setter
    @Column
    @NotNull
    private Operator creator;
    @Getter
    @Setter
    @Column
    @NotNull
    private Date createDateTime;
    @Getter
    @Setter
    @Column
    private Operator submitter;
    @Getter
    @Setter
    @Column
    private Date submitDateTime;
    @Getter
    @Setter
    @Column
    private boolean deleted;

    public boolean isSubmitted() {
        return getSubmitDateTime() != null && getSubmitter() != null;
    }

    @JsonIgnore
    public boolean isFirst() {
        return getType() == DyeingType.FIRST;
    }

    @JsonIgnore
    public boolean isCross() {
        return getType() == DyeingType.CROSS_LINEMACHINE_SPINDLE || getType() == DyeingType.CROSS_LINEMACHINE_LINEMACHINE;
    }

    @JsonIgnore
    public boolean isMulti() {
        return getType() == DyeingType.SECOND || getType() == DyeingType.THIRD;
    }

    public Collection<SilkCarRecord> prepareSilkCarRecords() {
        switch (getType()) {
            case CROSS_LINEMACHINE_LINEMACHINE: {
                return Lists.newArrayList(getSilkCarRecord1(), getSilkCarRecord2());
            }
            default: {
                return Lists.newArrayList(getSilkCarRecord());
            }
        }
    }

    public Collection<Silk> prepareSilks() {
        switch (getType()) {
            case CROSS_LINEMACHINE_LINEMACHINE: {
                final Stream<Silk> stream1 = getSilks1().stream();
                final Stream<Silk> stream2 = getSilks2().stream();
                return Stream.concat(stream1, stream2).collect(Collectors.toList());
            }
            default: {
                return getSilks();
            }
        }
    }

}
