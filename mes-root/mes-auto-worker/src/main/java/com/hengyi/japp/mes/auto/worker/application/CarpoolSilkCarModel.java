package com.hengyi.japp.mes.auto.worker.application;

import com.google.common.collect.ImmutableList;
import com.hengyi.japp.mes.auto.domain.Silk;
import com.hengyi.japp.mes.auto.domain.SilkCar;
import com.hengyi.japp.mes.auto.domain.data.SilkCarPosition;
import com.hengyi.japp.mes.auto.domain.data.SilkCarSideType;
import com.hengyi.japp.mes.auto.dto.CheckSilkDTO;
import com.hengyi.japp.mes.auto.repository.SilkRepository;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import static com.hengyi.japp.mes.auto.worker.Worker.INJECTOR;

/**
 * @author jzb 2018-11-15
 */
@Slf4j
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class CarpoolSilkCarModel extends AbstractSilkCarModel {

    public CarpoolSilkCarModel(SilkCar silkCar) {
        super(silkCar);
    }

    @Override
    public List<SilkCarPosition> getOrderedSilkPositions() {
        final ImmutableList.Builder<SilkCarPosition> builder = ImmutableList.builder();
        final int silkCarRow = silkCar.getRow();
        final int silkCarCol = silkCar.getCol();
        for (SilkCarSideType sideType : SilkCarSideType.values()) {
            for (int silkRow = 1; silkRow <= silkCarRow; silkRow++) {
                for (int silkCol = 1; silkCol <= silkCarCol; silkCol++) {
                    final SilkCarPosition silkPosition = new SilkCarPosition();
                    silkPosition.setSideType(sideType);
                    silkPosition.setRow(silkRow);
                    silkPosition.setCol(silkCol);
                    builder.add(silkPosition);
                }
            }
        }
        return builder.build();
    }

    @Override
    public List<SilkRuntime> generateSilkRuntimes(List<CheckSilkDTO> checkSilks) {
        final SilkRepository silkRepository = INJECTOR.getInstance(SilkRepository.class);

        final ImmutableList.Builder<SilkRuntime> builder = ImmutableList.builder();
        final List<SilkCarPosition> orderedSilkPositions = getOrderedSilkPositions();
        int posIndex = 0;
        for (CheckSilkDTO checkSilk : checkSilks) {
            final SilkCarPosition silkPosition = orderedSilkPositions.get(posIndex++);
            final SilkRuntime silkRuntime = new SilkRuntime();
            silkRuntime.setSideType(silkPosition.getSideType());
            silkRuntime.setRow(silkPosition.getRow());
            silkRuntime.setCol(silkPosition.getCol());
            final Silk silk = silkRepository.findByCode(checkSilk.getCode()).get();
            if (!silk.isDetached()) {
                final String msg = "checkSilk[" + checkSilk.getCode() + "]，非解绑丝锭拼车";
                log.error(msg);
                //todo 解绑逻辑更新
                throw new RuntimeException(msg);
            }
            if (silk.isDyeingSample()) {
                final String msg = "checkSilk[" + checkSilk.getCode() + "]，标样丝拼车";
                throw new RuntimeException(msg);
            }
            if (silk.getTemporaryBox() != null) {
                final String msg = "checkSilk[" + checkSilk.getCode() + "]，暂存箱丝锭拼车";
                throw new RuntimeException(msg);
            }
            silk.setDetached(false);
            silkRuntime.setSilk(silk);

            builder.add(silkRuntime);
        }
        return addAll(builder.build());
    }

    @Override
    public List<CheckSilkDTO> checkSilks() {
        throw new IllegalAccessError();
    }

}
