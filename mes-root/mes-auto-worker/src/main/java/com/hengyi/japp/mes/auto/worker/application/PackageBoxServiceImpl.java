package com.hengyi.japp.mes.auto.worker.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.github.ixtf.japp.core.J;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.AuthService;
import com.hengyi.japp.mes.auto.application.PackageBoxService;
import com.hengyi.japp.mes.auto.application.command.PackageBoxAppendCommand;
import com.hengyi.japp.mes.auto.application.command.PackageBoxBatchPrintUpdateCommand;
import com.hengyi.japp.mes.auto.application.command.PackageBoxMeasureInfoUpdateCommand;
import com.hengyi.japp.mes.auto.domain.data.PackageBoxType;
import com.hengyi.japp.mes.auto.domain.data.RoleType;
import com.hengyi.japp.mes.auto.domain.data.TemporaryBoxRecordType;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import com.hengyi.japp.mes.auto.event.PackageBoxEvent;
import com.hengyi.japp.mes.auto.exception.MultiBatchException;
import com.hengyi.japp.mes.auto.exception.MultiGradeException;
import com.hengyi.japp.mes.auto.repository.*;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.IterableUtils;

import java.security.Principal;
import java.util.stream.Stream;

import static com.github.ixtf.japp.core.Constant.MAPPER;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

/**
 * @author jzb 2018-06-22
 */
@Slf4j
@Singleton
public class PackageBoxServiceImpl implements PackageBoxService {
    private final AuthService authService;
    private final PackageBoxRepository packageBoxRepository;
    private final SilkCarRecordRepository silkCarRecordRepository;
    private final OperatorRepository operatorRepository;
    private final PackageClassRepository packageClassRepository;
    private final SapT001lRepository sapT001lRepository;
    private final TemporaryBoxRepository temporaryBoxRepository;
    private final TemporaryBoxRecordRepository temporaryBoxRecordRepository;
    private final BatchRepository batchRepository;
    private final GradeRepository gradeRepository;

    @Inject
    private PackageBoxServiceImpl(AuthService authService, PackageBoxRepository packageBoxRepository, SilkCarRecordRepository silkCarRecordRepository, OperatorRepository operatorRepository, PackageClassRepository packageClassRepository, SapT001lRepository sapT001lRepository, TemporaryBoxRepository temporaryBoxRepository, TemporaryBoxRecordRepository temporaryBoxRecordRepository, BatchRepository batchRepository, GradeRepository gradeRepository) {
        this.authService = authService;
        this.packageBoxRepository = packageBoxRepository;
        this.silkCarRecordRepository = silkCarRecordRepository;
        this.operatorRepository = operatorRepository;
        this.packageClassRepository = packageClassRepository;
        this.sapT001lRepository = sapT001lRepository;
        this.temporaryBoxRepository = temporaryBoxRepository;
        this.temporaryBoxRecordRepository = temporaryBoxRecordRepository;
        this.batchRepository = batchRepository;
        this.gradeRepository = gradeRepository;
    }

    @SneakyThrows
    @Override
    public PackageBox handle(Principal principal, PackageBoxEvent.ManualCommandSimple command) {
        final Operator operator = operatorRepository.find(principal);
        authService.checkRole(operator, RoleType.PACKAGE_BOX);
        final PackageBox packageBox = new PackageBox();
        final PackageBoxEvent event = new PackageBoxEvent();
        event.setCommand(MAPPER.convertValue(command, JsonNode.class));
        event.fire(operator);
        event.setPackageBox(packageBox);
        packageBox.log(event.getOperator(), event.getFireDateTime());
        packageBox.setPrintDate(event.getFireDateTime());
        packageBox.setSilkCount(command.getSilkCount());
        packageBox.setType(PackageBoxType.MANUAL);
        packageBox.command(event.getCommand());
        final List<SilkCarRuntime> silkCarRuntimes = command.getSilkCarRecords()
                .parallelStream()
                .map(it -> silkCarRecordRepository.find(it).get())
                .collect(toList());
        final Batch batch = checkAndGetBatch(silkCarRuntimes);
        packageBox.setBatch(batch);
        final Grade grade = checkAndGetGrade(silkCarRuntimes);
        packageBox.setGrade(grade);
        final Collection<SilkCarRecord> silkCarRecords = silkCarRuntimes.stream()
                .map(SilkCarRuntime::getSilkCarRecord)
                .collect(toSet());
        packageBox.setSilkCarRecords(silkCarRecords);
        final PackageBox result = packageBoxRepository.save(packageBox);
        silkCarRuntimes.forEach(it -> silkCarRecordRepository.addEventSource(it, event));
        return result;
    }

    private Batch checkAndGetBatch(Collection<SilkCarRuntime> silkCarRuntimes) throws Exception {
        final Set<Batch> batchSet = Stream.concat(
                silkCarRuntimes.stream()
                        .map(SilkCarRuntime::getSilkRuntimes)
                        .flatMap(Collection::stream)
                        .map(SilkRuntime::getSilk)
                        .map(Silk::getBatch)
                        .distinct(),
                silkCarRuntimes.stream()
                        .map(SilkCarRuntime::getSilkCarRecord)
                        .map(SilkCarRecord::getBatch)
                        .distinct()
        ).collect(toSet());
        if (batchSet.size() == 1) {
            return IterableUtils.get(batchSet, 0);
        }
        throw new MultiBatchException();
    }

    private Grade checkAndGetGrade(Collection<SilkCarRuntime> silkCarRuntimes) throws Exception {
        final Set<Grade> gradeSet = silkCarRuntimes.stream()
                .map(SilkCarRuntime::getSilkRuntimes)
                .flatMap(Collection::stream)
                .map(SilkRuntime::getGrade)
                .collect(toSet());
        if (gradeSet.size() == 1) {
            return IterableUtils.get(gradeSet, 0);
        }
        throw new MultiGradeException();
    }

    @SneakyThrows
    @Override
    public PackageBox handle(Principal principal, PackageBoxEvent.TemporaryBoxCommand command) {
        final Operator operator = operatorRepository.find(principal);
        authService.checkRole(operator, RoleType.PACKAGE_BOX);
        final PackageBox packageBox = new PackageBox();
        final Date currentDateTime = new Date();
        packageBox.log(operator, currentDateTime);
        packageBox.setPrintDate(currentDateTime);
        packageBox.setType(PackageBoxType.MANUAL);
        packageBox.setSilkCount(command.getCount());
        final TemporaryBox temporaryBox = temporaryBoxRepository.find(command.getTemporaryBox()).get();
        packageBox.setBatch(temporaryBox.getBatch());
        packageBox.setGrade(temporaryBox.getGrade());
        final TemporaryBoxRecord temporaryBoxRecord = new TemporaryBoxRecord();
        temporaryBoxRecord.setType(TemporaryBoxRecordType.PACKAGE_BOX);
        temporaryBoxRecord.setTemporaryBox(temporaryBox);
        temporaryBoxRecord.setPackageBox(packageBox);
        temporaryBoxRecord.setCount(packageBox.getSilkCount() * -1);
        temporaryBoxRecord.log(operator, currentDateTime);
        final PackageBox result = packageBoxRepository.save(packageBox);
        temporaryBoxRecordRepository.save(temporaryBoxRecord);
        return result;
    }

    @Override
    public PackageBox update(Principal principal, String id, PackageBoxMeasureInfoUpdateCommand command) {
        final PackageBox packageBox = packageBoxRepository.find(id).get();
        if (PackageBoxType.AUTO != packageBox.getType()) {
            packageBox.setSilkCount(command.getSilkCount());
            packageBox.setNetWeight(command.getNetWeight());
            packageBox.setGrossWeight(command.getGrossWeight());
        }
        packageBox.setBudat(command.getBudat());
        packageBox.setPalletType(command.getPalletType());
        packageBox.setPackageType(command.getPackageType());
        packageBox.setSaleType(command.getSaleType());
        packageBox.setFoamType(command.getFoamType());
        packageBox.setFoamNum(command.getFoamNum());
        Optional.ofNullable(command.getPalletCode())
                .filter(J::nonBlank)
                .filter(it -> PackageBoxType.AUTO != packageBox.getType())
                .ifPresent(packageBox::setPalletCode);
        final PackageClass budatClass = packageClassRepository.find(command.getBudatClass()).get();
        packageBox.setBudatClass(budatClass);
        final SapT001l sapT001l = sapT001lRepository.find(command.getSapT001l()).get();
        packageBox.setSapT001l(sapT001l);
        final Operator operator = operatorRepository.find(principal);
        packageBox.log(operator);
        return packageBoxRepository.save(packageBox);
    }

    @Override
    public PackageBox print(Principal principal, String id) {
        final Operator operator = operatorRepository.find(principal);
        final PackageBox packageBox = packageBoxRepository.find(id).get();
        final int printCount = packageBox.getPrintCount();
        packageBox.setPrintCount(printCount + 1);
        packageBox.log(operator);
        return packageBoxRepository.save(packageBox);
    }

    @Override
    public void print(Principal principal, PackageBoxBatchPrintUpdateCommand command) {
        command.getPackageBoxes().parallelStream().map(EntityDTO::getId).forEach(it -> print(principal, it));
    }

    @SneakyThrows
    @Override
    public void delete(Principal principal, String id) {
        throw new IllegalAccessException();
//        final Collection<PackageBoxType> canDeleteTypes = ImmutableSet.of(PackageBoxType.MANUAL_APPEND, PackageBoxType.MANUAL);
//        return packageBoxRepository.find(id).flatMapCompletable(packageBox -> {
//            if (!canDeleteTypes.contains(packageBox.getType())) {
//                throw new RuntimeException();
//            }
//            packageBox.setDeleted(true);
//            return operatorRepository.find(principal).flatMapCompletable(operator -> {
//                packageBox.log(operator);
//                final Completable saveSilks$ = Flowable.fromIterable(J.emptyIfNull(packageBox.getSilks())).flatMapCompletable(silk -> {
//                    silk.setPackageBox(null);
//                    silk.setPackageDateTime(null);
//                    return silkRepository.save(silk).ignoreElement();
//                });
//                // todo 暂存箱打包
//                final Completable savePackageBox$ = packageBoxRepository.save(packageBox).ignoreElement();
//                return Completable.mergeArray(savePackageBox$, saveSilks$);
//            });
//        });
    }

    @SneakyThrows
    @Override
    public PackageBox handle(Principal principal, PackageBoxAppendCommand command) {
        authService.checkPermission(principal, "PackageBox:ManualAppend");
        final PackageBox packageBox = new PackageBox();
        packageBox.setType(PackageBoxType.MANUAL_APPEND);
        packageBox.setSilkCount(command.getSilkCount());
        packageBox.setBudat(command.getBudat());
        packageBox.setPrintDate(command.getBudat());
        packageBox.setGrossWeight(command.getGrossWeight());
        packageBox.setNetWeight(command.getNetWeight());
        packageBox.setPalletType(command.getPalletType());
        packageBox.setPackageType(command.getPackageType());
        packageBox.setSaleType(command.getSaleType());
        packageBox.setFoamType(command.getFoamType());
        packageBox.setFoamNum(command.getFoamNum());
        final Batch batch = batchRepository.find(command.getBatch()).get();
        packageBox.setBatch(batch);
        final Grade grade = gradeRepository.find(command.getGrade()).get();
        packageBox.setGrade(grade);
        final PackageClass budatClass = packageClassRepository.find(command.getBudatClass()).get();
        packageBox.setBudatClass(budatClass);
        packageBox.setPrintClass(budatClass);
        final SapT001l sapT001l = sapT001lRepository.find(command.getSapT001l()).get();
        packageBox.setSapT001l(sapT001l);
        final Operator operator = operatorRepository.find(principal);
        packageBox.log(operator);
        return packageBoxRepository.save(packageBox);
    }

}
