package com.hengyi.japp.mes.auto.worker.application;

import com.google.common.collect.ImmutableList;
import com.hengyi.japp.mes.auto.domain.*;
import com.hengyi.japp.mes.auto.domain.data.SilkCarPosition;
import com.hengyi.japp.mes.auto.dto.CheckSilkDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

import static com.hengyi.japp.mes.auto.worker.Worker.INJECTOR;
import static com.hengyi.japp.mes.auto.worker.application.AutoSilkCarModelConfigRegistry.*;

/**
 * todo 配置文件形式，自定义落筒顺序
 *
 * @author jzb 2018-11-15
 */
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class AutoSilkCarModel extends AbstractSilkCarModel {
    @EqualsAndHashCode.Include
    private final Workshop workshop;
    private final Config config;

    public AutoSilkCarModel(SilkCar silkCar, Workshop workshop) {
        super(silkCar);
        this.workshop = workshop;
        config = INJECTOR.getInstance(AutoSilkCarModelConfigRegistry.class).find(silkCar, workshop);
    }

    @Override
    public List<SilkCarPosition> getOrderedSilkPositions() {
        return config.getOrderedSilkPositions();
    }

    @Override
    public List<SilkRuntime> generateSilkRuntimes(List<CheckSilkDTO> checkSilks) {
        final List<SilkBarcode> silkBarcodes = toSilkBarcodes(checkSilks);
        checkBatchChange(silkBarcodes);
        final List<SilkRuntime> result = generateSilkRuntimesBySilkBarcodes(silkBarcodes);
        checkPosition(result, checkSilks);
        return result;
    }

    private List<SilkRuntime> generateSilkRuntimesBySilkBarcodes(List<SilkBarcode> silkBarcodes) {
        final ImmutableList.Builder<SilkRuntime> builder = ImmutableList.builder();
        for (int orderBy = 0; orderBy < silkBarcodes.size(); orderBy++) {
            final SilkBarcode silkBarcode = silkBarcodes.get(orderBy);
            final LineMachine lineMachine = silkBarcode.getLineMachine();
            final LineMachineSpec lineMachineSpec = config.getLineMachineSpecs().get(orderBy);
            for (int spindle : lineMachine.getSpindleSeq()) {
                final SilkRuntime silkRuntime = new SilkRuntime();
                final Silk silk = new Silk();
                silkRuntime.setSilk(silk);
                silk.setCode(silkBarcode.generateSilkCode(spindle));
                silk.setDoffingNum(silkBarcode.getDoffingNum());
                silk.setSpindle(spindle);
                silk.setLineMachine(lineMachine);
                silk.setBatch(lineMachine.getProductPlan().getBatch());

                final LineMachineSilkSpec lineMachineSilkSpec = lineMachineSpec.findSilkSpecBySpindle(spindle);
                silkRuntime.setSideType(lineMachineSilkSpec.getSideType());
                silkRuntime.setRow(lineMachineSilkSpec.getRow());
                silkRuntime.setCol(lineMachineSilkSpec.getCol());
                builder.add(silkRuntime);
            }
        }
        return builder.build();
    }

    @Override
    public List<CheckSilkDTO> checkSilks() {
        return config.checkSilks();
    }

}
