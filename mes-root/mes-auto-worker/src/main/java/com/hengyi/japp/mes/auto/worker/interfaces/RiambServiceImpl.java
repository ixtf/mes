package com.hengyi.japp.mes.auto.worker.interfaces;

import com.fasterxml.jackson.databind.JsonNode;
import com.github.ixtf.japp.core.J;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.ApplicationEvents;
import com.hengyi.japp.mes.auto.domain.data.PackageBoxType;
import com.hengyi.japp.mes.auto.domain.data.SaleType;
import com.hengyi.japp.mes.auto.event.EventSourceType;
import com.hengyi.japp.mes.auto.event.SilkNoteFeedbackEvent;
import com.hengyi.japp.mes.auto.interfaces.riamb.RiambService;
import com.hengyi.japp.mes.auto.interfaces.riamb.dto.RiambFetchSilkCarRecordResultDTO;
import com.hengyi.japp.mes.auto.interfaces.riamb.event.RiambPackageBoxEvent;
import com.hengyi.japp.mes.auto.interfaces.riamb.event.RiambSilkCarInfoFetchEvent;
import com.hengyi.japp.mes.auto.interfaces.riamb.event.RiambSilkDetachEvent;
import com.hengyi.japp.mes.auto.repository.*;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.IterableUtils;
import org.eclipse.microprofile.reactive.streams.operators.ReactiveStreams;

import java.security.Principal;

import static com.github.ixtf.japp.core.Constant.MAPPER;
import static com.hengyi.japp.mes.auto.interfaces.riamb.dto.RiambFetchSilkCarRecordResultDTO.*;
import static java.util.stream.Collectors.toSet;

/**
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
public class RiambServiceImpl implements RiambService {
    private final ApplicationEvents applicationEvents;
    private final SilkCarRecordRepository silkCarRecordRepository;
    private final SilkRepository silkRepository;
    private final PackageBoxRepository packageBoxRepository;
    private final BatchRepository batchRepository;
    private final GradeRepository gradeRepository;
    private final PackageClassRepository packageClassRepository;
    private final SapT001lRepository sapT001lRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private RiambServiceImpl(ApplicationEvents applicationEvents, SilkCarRecordRepository silkCarRecordRepository, SilkRepository silkRepository, PackageBoxRepository packageBoxRepository, BatchRepository batchRepository, GradeRepository gradeRepository, PackageClassRepository packageClassRepository, SapT001lRepository sapT001lRepository, OperatorRepository operatorRepository) {
        this.applicationEvents = applicationEvents;
        this.silkCarRecordRepository = silkCarRecordRepository;
        this.silkRepository = silkRepository;
        this.packageBoxRepository = packageBoxRepository;
        this.batchRepository = batchRepository;
        this.gradeRepository = gradeRepository;
        this.packageClassRepository = packageClassRepository;
        this.sapT001lRepository = sapT001lRepository;
        this.operatorRepository = operatorRepository;
    }

    @Override
    public RiambFetchSilkCarRecordResultDTO fetchSilkCarRecord(Principal principal, String code) {
        final RiambSilkCarInfoFetchEvent event = new RiambSilkCarInfoFetchEvent();
        event.fire(operatorRepository.find(principal));
        final SilkCarRuntime silkCarRuntime = silkCarRecordRepository.findSilkCarRuntime(code).get();
        final RiambFetchSilkCarRecordResultDTO dto = getResult(silkCarRuntime);
        event.setResult(dto);
        if (packeFlage_YES.equals(dto.getPackeFlage())) {
            saveSilkExceptions(dto);
            silkCarRecordRepository.addEventSource(silkCarRuntime, event);
        }
        return dto;
    }

    private RiambFetchSilkCarRecordResultDTO getResult(SilkCarRuntime silkCarRuntime) {
        final RiambFetchSilkCarRecordResultDTO dto = new RiambFetchSilkCarRecordResultDTO();
        final var silkCarInfo = new RiambFetchSilkCarRecordResultDTO.SilkCarInfo();
        final List<RiambFetchSilkCarRecordResultDTO.SilkInfo> silkInfos = Lists.newArrayList();
        dto.setSilkCarInfo(silkCarInfo);
        dto.setSilkInfos(silkInfos);

        final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
        final SilkCar silkCar = silkCarRecord.getSilkCar();
        final Batch batch = silkCarRecord.getBatch();
        final Collection<SilkRuntime> silkRuntimes = J.emptyIfNull(silkCarRuntime.getSilkRuntimes());

        silkCarInfo.setId(silkCarRecord.getId());
        silkCarInfo.setCode(silkCar.getCode());
        silkCarInfo.setRow(silkCar.getRow());
        silkCarInfo.setCol(silkCar.getCol());
        silkCarInfo.setBatchNo(batch.getBatchNo());

        final List<SilkRuntime> dyeingUnSubmitteds = Lists.newArrayList();
        final Set<SilkNote> feedbackSilkNotes = Sets.newHashSet();
        for (SilkRuntime silkRuntime : silkRuntimes) {
            final Silk silk = silkRuntime.getSilk();
            final LineMachine lineMachine = silk.getLineMachine();
            final Line line = lineMachine.getLine();
            final String spec = line.getName() + "-" + silk.getSpindle() + "/" + lineMachine.getItem();
            final Grade grade = Optional.ofNullable(silkRuntime.getGrade()).orElse(silkCarRecord.getGrade());

            final var silkInfo = new RiambFetchSilkCarRecordResultDTO.SilkInfo();
            silkInfos.add(silkInfo);
            feedbackSilkNotes.addAll(J.emptyIfNull(silkRuntime.getNotes()));

            silkInfo.setCode(silk.getCode());
            silkInfo.setSideType(silkRuntime.getSideType());
            silkInfo.setRow(silkRuntime.getRow());
            silkInfo.setCol(silkRuntime.getCol());
            silkInfo.setSpec(spec);
            silkInfo.setBatchNo(batch.getBatchNo());
            silkInfo.setGradeName(grade.getName());
            silkInfo.setDoffingNum(silk.getDoffingNum());
            silkInfo.setDoffingDateTime(silk.getDoffingDateTime());
            silkInfo.setDoffingOperatorName(silk.getDoffingOperator().getName());
            silkInfo.setDoffingType(silk.getDoffingType());

            final Collection<SilkException> silkExceptions = J.emptyIfNull(silkRuntime.getExceptions());
            silkInfo.setSilkExceptions(silkExceptions);
            silkInfo.setEliminateFlage(J.nonEmpty(silkExceptions) ? eliminateFlage_YES : eliminateFlage_NO);
            silkInfo.setDyeingSubmitted(true);
            if (silkCarRecord.getDoffingType() == null) {
                final SilkRuntime.DyeingResultInfo multiDyeingResultInfo = silkRuntime.getMultiDyeingResultInfo();
                silkInfo.accept(multiDyeingResultInfo);
            } else {
                final SilkRuntime.DyeingResultInfo firstDyeingResultInfo = silkRuntime.getFirstDyeingResultInfo();
                silkInfo.accept(firstDyeingResultInfo);
                final SilkRuntime.DyeingResultInfo crossDyeingResultInfo = silkRuntime.getCrossDyeingResultInfo();
                silkInfo.accept(crossDyeingResultInfo);
            }
            if (J.nonEmpty(silkInfo.getDyeingExceptionStrings())) {
                silkInfo.setEliminateFlage(eliminateFlage_YES);
            }
            if (silkInfo.isDyeingSubmitted()) {
                silkInfo.setGrabFlage(grabFlage_YES);
            } else {
                silkInfo.setGrabFlage(grabFlage_NO);
                dyeingUnSubmitteds.add(silkRuntime);
            }
        }

        dto.setPackeFlage(J.isEmpty(dyeingUnSubmitteds) ? packeFlage_YES : packeFlage_NO);
        J.emptyIfNull(silkCarRuntime.getEventSources()).stream()
                .filter(it -> !it.isDeleted() && it.getType() == EventSourceType.SilkNoteFeedbackEvent)
                .forEach(it -> {
                    final SilkNoteFeedbackEvent silkNoteFeedbackEvent = (SilkNoteFeedbackEvent) it;
                    final SilkNote silkNote = silkNoteFeedbackEvent.getSilkNote();
                    feedbackSilkNotes.remove(silkNote);
                });
        final Set<SilkNote> checkFeedbackSilkNotes = J.emptyIfNull(feedbackSilkNotes).stream()
                .filter(SilkNote::isMustFeedback)
                .collect(toSet());
        if (J.nonEmpty(checkFeedbackSilkNotes)) {
            dto.setPackeFlage(packeFlage_NO);
        }
        if (packeFlage_NO.equals(dto.getPackeFlage())) {
            final List<String> reasons = Lists.newArrayList();
            if (J.nonEmpty(dyeingUnSubmitteds)) {
                reasons.add("染判结果未出");
            }
            if (J.nonEmpty(checkFeedbackSilkNotes)) {
                checkFeedbackSilkNotes.forEach(silkNote -> {
                    final String name = silkNote.getName();
                    reasons.add(name + "未处理");
                });
            }
            applicationEvents.fire(silkCarRuntime, dto, reasons);
        }
        dto.setSilkCount(silkInfos.size());
        return dto;
    }

    private void saveSilkExceptions(RiambFetchSilkCarRecordResultDTO dto) {
        J.emptyIfNull(dto.getSilkInfos()).forEach(silkInfo -> {
            final String code = silkInfo.getCode();
            final Silk silk = silkRepository.findByCode(code).get();
            final Set<SilkException> silkExceptions = Sets.newHashSet(J.emptyIfNull(silk.getExceptions()));
            silkExceptions.addAll(J.emptyIfNull(silkInfo.getSilkExceptions()));
            silk.setExceptions(silkExceptions);
            final Set<String> dyeingExceptionStrings = Sets.newHashSet(J.emptyIfNull(silk.getDyeingExceptionStrings()));
            dyeingExceptionStrings.addAll(J.emptyIfNull(silkInfo.getDyeingExceptionStrings()));
            silk.setDyeingExceptionStrings(dyeingExceptionStrings);
            silkRepository.save(silk);
        });
    }

    @Override
    public void silkDetach(Principal principal, RiambSilkDetachEvent.Command command) {
        final var silkCarInfo = command.getSilkCarInfo();
        final SilkCarRuntime silkCarRuntime = silkCarRecordRepository.findSilkCarRuntime(silkCarInfo).get();
        final RiambSilkDetachEvent event = new RiambSilkDetachEvent();
        event.fire(operatorRepository.find(principal));
        event.setCommand(command);
        silkCarRecordRepository.addEventSource(silkCarRuntime, event);
    }

    @SneakyThrows
    @Override
    public void packageBox(Principal principal, RiambPackageBoxEvent.Command command) {
        final PackageBox packageBox = packageBoxRepository.findByCode(command.getCode()).orElse(new PackageBox());
        final var jobInfo = command.getJobInfo();

        packageBox.setType(PackageBoxType.AUTO);
        packageBox.command(MAPPER.convertValue(command, JsonNode.class));
        packageBox.setCode(command.getCode());
        packageBox.setNetWeight(command.getNetWeight().doubleValue());
        packageBox.setGrossWeight(command.getGrossWeight().doubleValue());
        packageBox.setSilkCount(command.getSilkCount());
        packageBox.setPrintDate(command.getCreateDateTime());
        packageBox.setCreateDateTime(command.getCreateDateTime());
        packageBox.setPalletCode(command.getPalletCode());

        packageBox.setRiambJobId(jobInfo.getId());
        packageBox.setAutomaticPackeLine(jobInfo.getAutomaticPackeLine());
        packageBox.setBudat(jobInfo.getBudatDate());
        packageBox.setPackageType(jobInfo.getPackageType());
        packageBox.setPalletType(jobInfo.getPalletType());
        packageBox.setFoamType(jobInfo.getFoamType());
        packageBox.setFoamNum(jobInfo.getFoamNum());
        packageBox.setSaleType(getSaleType(jobInfo));

        final PackageClass packageClass = packageClassRepository.findByName(jobInfo.getPackageClassNo()).get();
        packageBox.setPrintClass(packageClass);
        packageBox.setBudatClass(packageClass);

        final Grade grade = gradeRepository.findByName(jobInfo.getGradeName()).get();
        packageBox.setGrade(grade);

        final Batch batch = batchRepository.findByBatchNo(jobInfo.getBatchNo()).get();
        packageBox.setBatch(batch);

        final Operator operator = operatorRepository.findByHrId(jobInfo.getCreatorHrId()).get();
        packageBox.log(operator, command.getCreateDateTime());

        final SapT001l sapT001l = sapT001lRepository.find(jobInfo.getLgort()).get();
        packageBox.setSapT001l(sapT001l);

        final Set<Silk> silks = ReactiveStreams.fromIterable(J.emptyIfNull(command.getSilkInfos()))
                .map(RiambPackageBoxEvent.SilkInfo::getCode)
                .map(silkRepository::findByCode)
                .toList().run().toCompletableFuture().get()
                .stream()
                .flatMap(Optional::stream)
                .collect(toSet());
        packageBox.setSilks(silks);
        if (packageBox.getSilkCount() != silks.size()) {
            log.error("PackageBox[" + packageBox.getCode() + "],丝锭颗数不符,实际[" + packageBox.getSilkCount() + "],落丝[" + silks.size() + "]!");
        }
        final Set<Batch> batches = J.emptyIfNull(silks).stream().map(Silk::getBatch).collect(toSet());
        if (batches.size() == 1) {
            final Batch batchCheck = IterableUtils.get(batches, 0);
            if (!Objects.equals(packageBox.getBatch(), batchCheck)) {
                log.error("PackageBox[" + packageBox.getCode() + "],混批!");
            }
        } else {
            log.error("PackageBox[" + packageBox.getCode() + "],混批!");
        }

        packageBoxRepository.save(packageBox);
        silks.forEach(silk -> {
            silk.setPackageBox(packageBox);
            silk.setPackageDateTime(packageBox.getPrintDate());
            silk.setGrade(packageBox.getGrade());
            silkRepository.save(silk);
        });
    }

    private SaleType getSaleType(RiambPackageBoxEvent.AutomaticPackeJobInfo jobInfo) {
        switch (jobInfo.getSaleType()) {
            case "FOREIGN":
            case "外贸": {
                return SaleType.FOREIGN;
            }

            case "DOMESTIC":
            case "内销":
            case "内贸": {
                return SaleType.DOMESTIC;
            }
        }
        return null;
    }

}
