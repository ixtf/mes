package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.collect.ImmutableList;
import com.hengyi.japp.mes.auto.domain.data.SilkCarSideType;
import com.hengyi.japp.mes.auto.domain.data.SilkCarType;
import com.hengyi.japp.mes.auto.dto.CheckSilkDTO;
import lombok.*;

import javax.persistence.Cacheable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Date;
import java.util.List;
import java.util.stream.IntStream;

/**
 * 丝车
 *
 * @author jzb 2018-06-20
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Cacheable
@Entity
public class SilkCar implements EntityLoggable {
    @ToString.Include
    @EqualsAndHashCode.Include
    @Getter
    @Setter
    @Id
    @NotBlank
    private String id;
    @Getter
    @Setter
    @Column
    @NotNull
    private SilkCarType type;
    /**
     * 丝车编号
     */
    @Getter
    @Setter
    @Column
    @NotBlank
    private String number;
    /**
     * 丝车编码，条形码
     */
    @ToString.Include
    @Getter
    @Setter
    @Column(unique = true)
    @NotBlank
    private String code;
    @Getter
    @Setter
    @Column
    @Min(1)
    private int row;
    @Getter
    @Setter
    @Column
    @Min(1)
    private int col;

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

    public List<CheckSilkDTO> checkSilks(SilkCarSideType silkCarSideType) {
        final ImmutableList.Builder<CheckSilkDTO> builder = ImmutableList.builder();
        IntStream.rangeClosed(1, getRow()).mapToObj(r -> checkSilks(silkCarSideType, r)).forEach(builder::addAll);
        return builder.build();
    }

    public List<CheckSilkDTO> checkSilks(SilkCarSideType silkCarSideType, int row) {
        final ImmutableList.Builder<CheckSilkDTO> builder = ImmutableList.builder();
        IntStream.rangeClosed(1, getCol()).filter(c -> !isMiddle(c)).mapToObj(c -> {
            final CheckSilkDTO checkSilk = new CheckSilkDTO();
            checkSilk.setSideType(silkCarSideType);
            checkSilk.setRow(row);
            checkSilk.setCol(c);
            return checkSilk;
        }).forEach(builder::add);
        return builder.build();
    }

    public boolean isMiddle(int c) {
        final int col = getCol();
        if (col % 2 == 0) {
            return false;
        }
        final int i = col / 2;
        return c == (i + 1);
    }

}
