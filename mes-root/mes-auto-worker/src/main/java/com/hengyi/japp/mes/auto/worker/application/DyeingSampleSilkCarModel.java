package com.hengyi.japp.mes.auto.worker.application;

import com.google.common.collect.ImmutableList;
import com.hengyi.japp.mes.auto.domain.SilkCar;
import com.hengyi.japp.mes.auto.domain.Workshop;
import com.hengyi.japp.mes.auto.domain.data.SilkCarSideType;
import com.hengyi.japp.mes.auto.dto.CheckSilkDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/**
 * @author jzb 2018-11-15
 */
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class DyeingSampleSilkCarModel extends ManualSilkCarModel {
    @EqualsAndHashCode.Include
    protected final Workshop workshop;

    public DyeingSampleSilkCarModel(SilkCar silkCar, Workshop workshop) {
        super(silkCar, 1);
        this.workshop = workshop;
    }

    @Override
    public List<CheckSilkDTO> checkSilks() {
        final ImmutableList.Builder<CheckSilkDTO> builder = ImmutableList.builder();
        builder.add(SilkCarModel.shuffle(silkCar.checkSilks(SilkCarSideType.A)));
        return builder.build();
    }
}
