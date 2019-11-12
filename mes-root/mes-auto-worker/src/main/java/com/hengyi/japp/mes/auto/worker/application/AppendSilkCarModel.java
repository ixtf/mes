package com.hengyi.japp.mes.auto.worker.application;

import com.google.common.collect.ImmutableList;
import com.hengyi.japp.mes.auto.domain.SilkBarcode;
import com.hengyi.japp.mes.auto.domain.SilkCarRecord;
import com.hengyi.japp.mes.auto.domain.data.SilkCarSideType;
import com.hengyi.japp.mes.auto.dto.CheckSilkDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import static com.hengyi.japp.mes.auto.worker.application.SilkCarModel.shuffle;

/**
 * @author jzb 2018-11-15
 */
@Slf4j
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class AppendSilkCarModel extends ManualSilkCarModel {
    private final SilkCarRuntime silkCarRuntime;

    public AppendSilkCarModel(SilkCarRuntime silkCarRuntime, float count) {
        super(silkCarRuntime.getSilkCarRecord().getSilkCar(), count);
        this.silkCarRuntime = silkCarRuntime;
    }

    @Override
    public List<SilkRuntime> generateSilkRuntimes(List<CheckSilkDTO> checkSilks) {
        final List<SilkBarcode> silkBarcodes = toSilkBarcodes(checkSilks);
        this.checkBatchChange(silkBarcodes);
        final ImmutableList.Builder<SilkRuntime> builder = ImmutableList.builder();
        final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
        silkCarRuntime.getSilkRuntimes().forEach(builder::add);
        final List<SilkRuntime> result = generateSilkRuntimesBySilkBarcodes(builder, silkBarcodes);
        result.removeAll(silkCarRuntime.getSilkRuntimes());
        checkPosition(result, checkSilks);
        return result;
    }

    @Override
    public List<CheckSilkDTO> checkSilks() {
        final ImmutableList.Builder<CheckSilkDTO> builder = ImmutableList.builder();
        if (lineMachineCount == 1) {
            builder.add(shuffle(silkCar.checkSilks(SilkCarSideType.B)));
            return builder.build();
        }
        throw new RuntimeException();
    }

}
