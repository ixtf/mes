package com.hengyi.japp.mes.auto.worker.application;

import com.google.common.collect.ImmutableList;
import com.hengyi.japp.mes.auto.application.SilkBarcodeService;
import com.hengyi.japp.mes.auto.domain.Batch;
import com.hengyi.japp.mes.auto.domain.SilkBarcode;
import com.hengyi.japp.mes.auto.domain.SilkCar;
import com.hengyi.japp.mes.auto.domain.SilkRuntime;
import com.hengyi.japp.mes.auto.domain.data.SilkCarPosition;
import com.hengyi.japp.mes.auto.domain.data.SilkCarType;
import com.hengyi.japp.mes.auto.dto.CheckSilkDTO;
import com.hengyi.japp.mes.auto.exception.BatchChangedException;
import com.hengyi.japp.mes.auto.exception.DoffingCapacityException;
import com.hengyi.japp.mes.auto.exception.DoffingTagException;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.SneakyThrows;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static com.hengyi.japp.mes.auto.worker.Worker.INJECTOR;

/**
 * @author jzb 2018-11-15
 */
@Data
public abstract class AbstractSilkCarModel implements SilkCarModel {
    @EqualsAndHashCode.Include
    protected final SilkCar silkCar;
    protected final int silkCarCapacity;

    protected AbstractSilkCarModel(SilkCar silkCar) {
        this.silkCar = silkCar;
        int capacity = silkCar.getRow() * silkCar.getCol() * 2;
        this.silkCarCapacity = silkCar.getType() == SilkCarType.BIG_SILK_CAR ? capacity * 2 : capacity;
    }

    @SneakyThrows
    protected List<SilkRuntime> addAll(List<SilkRuntime> silkRuntimes) {
        final ImmutableList.Builder<SilkRuntime> builder = ImmutableList.builder();
        final List<SilkCarPosition> orderedSilkPositions = getOrderedSilkPositions();
        if (silkRuntimes.size() > silkCarCapacity) {
            throw new DoffingCapacityException();
        }

        int posIndex = 0;
        for (SilkRuntime silkRuntime : silkRuntimes) {
            final SilkCarPosition silkPosition = orderedSilkPositions.get(posIndex++);
            silkRuntime.setSideType(silkPosition.getSideType());
            silkRuntime.setRow(silkPosition.getRow());
            silkRuntime.setCol(silkPosition.getCol());
            builder.add(silkRuntime);
        }
        return builder.build();
    }

    protected List<SilkBarcode> toSilkBarcodes(List<CheckSilkDTO> checkSilks) {
        final SilkBarcodeService silkBarcodeService = INJECTOR.getInstance(SilkBarcodeService.class);
        return checkSilks.stream()
                .map(it -> silkBarcodeService.findBySilkCode(it.getCode()).get())
                .collect(Collectors.toList());
    }

    @SneakyThrows
    protected void checkPosition(List<SilkRuntime> silkRuntimes, List<CheckSilkDTO> checkSilks) {
        for (CheckSilkDTO checkSilk : checkSilks) {
            final List<SilkRuntime> finds = silkRuntimes.stream().filter(silkRuntime ->
                    Objects.equals(silkRuntime.getSideType(), checkSilk.getSideType())
                            && Objects.equals(silkRuntime.getRow(), checkSilk.getRow())
                            && Objects.equals(silkRuntime.getCol(), checkSilk.getCol())
            ).collect(Collectors.toList());
            if (finds.size() == 1) {
                final SilkRuntime find = finds.get(0);
                if (Objects.equals(find.getSilk().getCode(), checkSilk.getCode())) {
                    continue;
                }
            }
            throw new DoffingTagException();
        }
    }

    @SneakyThrows
    public void checkBatchChange(List<SilkBarcode> silkBarcodes) {
        final boolean present = silkBarcodes.stream().filter(silkBarcode -> {
            final Batch printBatch = silkBarcode.getBatch();
            final Batch batch = silkBarcode.getLineMachine().getProductPlan().getBatch();
            return !Objects.equals(printBatch, batch);
        }).findFirst().isPresent();
        if (present) {
            throw new BatchChangedException();
        }
    }
}
