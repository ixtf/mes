package com.hengyi.japp.mes.auto.interfaces.warehouse.internal;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.collect.Sets;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.event.PackageBoxFlipEvent;
import com.hengyi.japp.mes.auto.domain.*;
import com.hengyi.japp.mes.auto.domain.data.PackageBoxFlipType;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import com.hengyi.japp.mes.auto.exception.MultiBatchException;
import com.hengyi.japp.mes.auto.exception.MultiGradeException;
import com.hengyi.japp.mes.auto.exception.SilkCarStatusException;
import com.hengyi.japp.mes.auto.interfaces.warehouse.WarehouseService;
import com.hengyi.japp.mes.auto.interfaces.warehouse.command.WarehousePackageBoxFetchCommand;
import com.hengyi.japp.mes.auto.repository.*;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;

import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static com.github.ixtf.japp.core.Constant.MAPPER;
import static java.util.stream.Collectors.toList;

/**
 * 仓库接口
 *
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
public class WarehouseServiceImpl implements WarehouseService {
    private final PackageBoxRepository packageBoxRepository;
    private final PackageBoxFlipRepository packageBoxFlipRepository;
    private final SilkCarRecordRepository silkCarRecordRepository;
    private final SilkRepository silkRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private WarehouseServiceImpl(PackageBoxRepository packageBoxRepository, PackageBoxFlipRepository packageBoxFlipRepository, SilkCarRecordRepository silkCarRecordRepository, SilkRepository silkRepository, OperatorRepository operatorRepository) {
        this.packageBoxRepository = packageBoxRepository;
        this.packageBoxFlipRepository = packageBoxFlipRepository;
        this.silkCarRecordRepository = silkCarRecordRepository;
        this.silkRepository = silkRepository;
        this.operatorRepository = operatorRepository;
    }

    @Override
    public PackageBox handle(Principal principal, WarehousePackageBoxFetchCommand command) {
        final PackageBox packageBox = packageBoxRepository.findByCode(command.getCode()).get();
        if (packageBox.getBudat() == null) {
            throw new RuntimeException("未计量");
        }
        packageBox.setInWarehouse(true);
        final Operator operator = operatorRepository.find(principal);
        packageBox.log(operator);
        return packageBoxRepository.save(packageBox);
    }

    @SneakyThrows
    @Override
    public PackageBoxFlip handle(Principal principal, PackageBoxFlipEvent.WarehouseCommand command) {
        final PackageBoxFlipEvent event = new PackageBoxFlipEvent();
        event.setCommand(MAPPER.convertValue(this, JsonNode.class));
        final Operator operator = operatorRepository.find(principal);
        event.fire(operator);
        final PackageBoxFlip packageBoxFlip = new PackageBoxFlip();
        packageBoxFlip.setType(PackageBoxFlipType.WAREHOUSE);
        packageBoxFlip.log(event.getOperator(), event.getFireDateTime());
        final PackageBox packageBox = packageBoxRepository.findByCode(command.getPackageBox()).get();
        packageBoxFlip.setPackageBox(packageBox);
        final List<Silk> inSilks = command.getInSilks()
                .parallelStream()
                .map(silkRepository::find)
                .map(Optional::get)
                .collect(toList());
        packageBoxFlip.setInSilks(inSilks);
        final var pairs = command.getItems().parallelStream().map(this::getPair).collect(toList());
        return checkAndSave(event, packageBoxFlip, pairs);
    }

    @SneakyThrows
    private Pair<SilkCarRuntime, List<SilkRuntime>> getPair(PackageBoxFlipEvent.Item item) {
        final SilkCarRuntime silkCarRuntime = silkCarRecordRepository.find(item.getSilkCarRecord()).get();
        final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
        final SilkCar silkCar = silkCarRecord.getSilkCar();
        final Set<String> silkIds = item.getSilks().stream().map(EntityDTO::getId).collect(Collectors.toSet());
        final List<SilkRuntime> silkRuntimes = silkCarRuntime.getSilkRuntimes().stream()
                .filter(it -> silkIds.contains(it.getSilk().getId()))
                .collect(toList());
        if (silkIds.size() == silkRuntimes.size()) {
            return Pair.of(silkCarRuntime, silkRuntimes);
        }
        throw new SilkCarStatusException(silkCar);
    }

    private PackageBoxFlip checkAndSave(PackageBoxFlipEvent event, PackageBoxFlip packageBoxFlip, List<Pair<SilkCarRuntime, List<SilkRuntime>>> pairs) throws MultiBatchException, MultiGradeException {
        final Set<Batch> batchSet = Sets.newConcurrentHashSet();
        final Set<Grade> gradeSet = Sets.newConcurrentHashSet();

        final PackageBox packageBox = packageBoxFlip.getPackageBox();
        batchSet.add(packageBox.getBatch());
        gradeSet.add(packageBox.getGrade());

        packageBoxFlip.getInSilks().forEach(silk -> {
            batchSet.add(silk.getBatch());
            gradeSet.add(silk.getGrade());
        });

        pairs.forEach(pair -> {
            final SilkCarRuntime silkCarRuntime = pair.getKey();
            final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
            final List<SilkRuntime> silkRuntimes = pair.getValue();
            silkRuntimes.forEach(silkRuntime -> {
                final Silk silk = silkRuntime.getSilk();
                batchSet.add(silkCarRecord.getBatch());
                batchSet.add(silk.getBatch());
                gradeSet.add(silk.getGrade());
            });
        });

        if (batchSet.size() != 1) {
            throw new MultiBatchException();
        }
        if (gradeSet.size() != 1) {
            throw new MultiGradeException();
        }

        final PackageBoxFlip result = packageBoxFlipRepository.save(packageBoxFlip);
        pairs.forEach(pair -> {
            final SilkCarRuntime silkCarRuntime = pair.getKey();
            silkCarRecordRepository.addEventSource(silkCarRuntime, event);
        });
        return result;
    }

}
