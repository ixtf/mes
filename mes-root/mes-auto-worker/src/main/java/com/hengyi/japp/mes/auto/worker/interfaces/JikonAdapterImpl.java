package com.hengyi.japp.mes.auto.worker.interfaces;

import com.fasterxml.jackson.databind.JsonNode;
import com.github.ixtf.japp.core.J;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.ApplicationEvents;
import com.hengyi.japp.mes.auto.domain.data.PackageBoxType;
import com.hengyi.japp.mes.auto.domain.data.SilkCarSideType;
import com.hengyi.japp.mes.auto.event.EventSourceType;
import com.hengyi.japp.mes.auto.event.SilkNoteFeedbackEvent;
import com.hengyi.japp.mes.auto.interfaces.facevisa.FacevisaService;
import com.hengyi.japp.mes.auto.interfaces.jikon.JikonAdapter;
import com.hengyi.japp.mes.auto.interfaces.jikon.JikonUtil;
import com.hengyi.japp.mes.auto.interfaces.jikon.dto.GetSilkSpindleInfoDTO;
import com.hengyi.japp.mes.auto.interfaces.jikon.event.JikonAdapterPackageBoxEvent;
import com.hengyi.japp.mes.auto.interfaces.jikon.event.JikonAdapterSilkCarInfoFetchEvent;
import com.hengyi.japp.mes.auto.interfaces.jikon.event.JikonAdapterSilkDetachEvent;
import com.hengyi.japp.mes.auto.repository.*;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.IterableUtils;

import java.security.Principal;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.github.ixtf.japp.core.Constant.MAPPER;
import static com.hengyi.japp.mes.auto.interfaces.jikon.dto.GetSilkSpindleInfoDTO.*;
import static com.hengyi.japp.mes.auto.worker.Worker.INJECTOR;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toMap;

/**
 * @author jzb 2018-06-20
 */
@Slf4j
@Singleton
public class JikonAdapterImpl implements JikonAdapter {
    private final ApplicationEvents applicationEvents;
    private final SilkCarRecordRepository silkCarRecordRepository;
    private final SilkRepository silkRepository;
    private final PackageBoxRepository packageBoxRepository;
    private final GradeRepository gradeRepository;
    private final PackageClassRepository packageClassRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private JikonAdapterImpl(ApplicationEvents applicationEvents, SilkCarRecordRepository silkCarRecordRepository, SilkRepository silkRepository, PackageBoxRepository packageBoxRepository, GradeRepository gradeRepository, PackageClassRepository packageClassRepository, OperatorRepository operatorRepository) {
        this.applicationEvents = applicationEvents;
        this.silkCarRecordRepository = silkCarRecordRepository;
        this.silkRepository = silkRepository;
        this.packageBoxRepository = packageBoxRepository;
        this.gradeRepository = gradeRepository;
        this.packageClassRepository = packageClassRepository;
        this.operatorRepository = operatorRepository;
    }

    @Override
    public String handle(Principal principal, JikonAdapterSilkCarInfoFetchEvent.Command command) {
        final JikonAdapterSilkCarInfoFetchEvent event = new JikonAdapterSilkCarInfoFetchEvent();
        event.setCommand(MAPPER.convertValue(command, JsonNode.class));
        final Operator operator = operatorRepository.find(principal);
        event.fire(operator);
        final String silkcarCode = command.getSilkcarCode();
        final SilkCarRuntime silkCarRuntime = silkCarRecordRepository.findSilkCarRuntime(silkcarCode).get();
        final GetSilkSpindleInfoDTO dto = getResult(silkCarRuntime, command);
        event.setResult(JikonUtil.success(dto));
        if (AutomaticPackeFlage_YES.equals(dto.getAutomaticPackeFlage())) {
            silkCarRecordRepository.addEventSource(silkCarRuntime, event);
            saveSilkExceptions(dto);
            prepareFacevisa(dto);
        }
        return event.getResult();
    }

    private void saveSilkExceptions(GetSilkSpindleInfoDTO dto) {
        J.emptyIfNull(dto.getList()).forEach(item -> {
            final String code = item.getSpindleCode();
            final Silk silk = silkRepository.findByCode(code).get();
            final Set<SilkException> silkExceptions = Sets.newHashSet(J.emptyIfNull(silk.getExceptions()));
            silkExceptions.addAll(J.emptyIfNull(item.getSilkExceptions()));
            silk.setExceptions(silkExceptions);
            final Set<String> dyeingExceptionStrings = Sets.newHashSet(J.emptyIfNull(silk.getDyeingExceptionStrings()));
            dyeingExceptionStrings.addAll(J.emptyIfNull(item.getDyeingExceptionStrings()));
            silk.setDyeingExceptionStrings(dyeingExceptionStrings);
            silkRepository.save(silk);
        });
    }

    private void prepareFacevisa(GetSilkSpindleInfoDTO dto) {
        if (AutomaticPackeFlage_NO.equals(dto.getAutomaticPackeFlage())) {
            return;
        }
        final FacevisaService facevisaService = INJECTOR.getInstance(FacevisaService.class);
        facevisaService.prepare(dto).subscribe();
    }

    private GetSilkSpindleInfoDTO getResult(SilkCarRuntime silkCarRuntime, JikonAdapterSilkCarInfoFetchEvent.Command command) {
        final GetSilkSpindleInfoDTO dto = new GetSilkSpindleInfoDTO();
        final Collection<SilkRuntime> silkRuntimes = J.emptyIfNull(silkCarRuntime.getSilkRuntimes());
        final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
        final SilkCar silkCar = silkCarRecord.getSilkCar();
        final Batch batch = silkCarRecord.getBatch();
        final int spec = silkCar.getRow() * silkCar.getCol() * 2;
        dto.setSpec("" + spec);

        final List<GetSilkSpindleInfoDTO.Item> items = Lists.newArrayList();
        //"Silk[" + silkRuntime.getSideType() + "-" + silkRuntime.getRow() + "-" + silkRuntime.getCol() + "]"
        final List<SilkRuntime> dyeingUnSubmitteds = Lists.newArrayList();
        final Set<SilkNote> feedbackSilkNotes = Sets.newHashSet();
        for (SilkRuntime silkRuntime : silkRuntimes) {
            final Silk silk = silkRuntime.getSilk();
            final Grade grade = Optional.ofNullable(silkRuntime.getGrade()).orElse(silkCarRecord.getGrade());
            final Collection<SilkException> silkExceptions = J.emptyIfNull(silkRuntime.getExceptions());

            final GetSilkSpindleInfoDTO.Item item = new GetSilkSpindleInfoDTO.Item();
            items.add(item);
            feedbackSilkNotes.addAll(J.emptyIfNull(silkRuntime.getNotes()));

            item.setSilkRuntime(silkRuntime);
            item.setSpindleCode(silk.getCode());
            item.setBatchNo(batch.getBatchNo());
            item.setGrade(grade.getId());
            item.setActualPosition(calcActualPosition(silkCar, silkRuntime));
            item.setSilkExceptions(silkExceptions);
            item.setEliminateFlage(J.nonEmpty(silkExceptions) ? eliminateFlage_YES : eliminateFlage_NO);
            item.setDyeingSubmitted(true);
            if (silkCarRecord.getDoffingType() == null) {
                final SilkRuntime.DyeingResultInfo multiDyeingResultInfo = silkRuntime.getMultiDyeingResultInfo();
                item.accept(multiDyeingResultInfo);
            } else {
                final SilkRuntime.DyeingResultInfo firstDyeingResultInfo = silkRuntime.getFirstDyeingResultInfo();
                item.accept(firstDyeingResultInfo);
                final SilkRuntime.DyeingResultInfo crossDyeingResultInfo = silkRuntime.getCrossDyeingResultInfo();
                item.accept(crossDyeingResultInfo);
            }
            if (J.nonEmpty(item.getDyeingExceptionStrings())) {
                item.setEliminateFlage(eliminateFlage_YES);
            }
            if (item.isDyeingSubmitted()) {
                item.setGrabFlage(grabFlage_YES);
            } else {
                item.setGrabFlage(grabFlage_NO);
                dyeingUnSubmitteds.add(silkRuntime);
            }
        }

        dto.setAutomaticPackeFlage(J.isEmpty(dyeingUnSubmitteds) ? AutomaticPackeFlage_YES : AutomaticPackeFlage_NO);
        J.emptyIfNull(silkCarRuntime.getEventSources()).stream()
                .filter(it -> !it.isDeleted() && it.getType() == EventSourceType.SilkNoteFeedbackEvent)
                .forEach(it -> {
                    final SilkNoteFeedbackEvent silkNoteFeedbackEvent = (SilkNoteFeedbackEvent) it;
                    final SilkNote silkNote = silkNoteFeedbackEvent.getSilkNote();
                    feedbackSilkNotes.remove(silkNote);
                });
        final Set<SilkNote> checkFeedbackSilkNotes = J.emptyIfNull(feedbackSilkNotes).stream()
                .filter(SilkNote::isMustFeedback)
                .collect(Collectors.toSet());
        if (J.nonEmpty(checkFeedbackSilkNotes)) {
            dto.setAutomaticPackeFlage(AutomaticPackeFlage_NO);
        }
        if (AutomaticPackeFlage_NO.equals(dto.getAutomaticPackeFlage())) {
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

        dto.setBindNum("" + items.size());
        dto.setList(items);
        return dto;
    }

    private String calcActualPosition(SilkCar silkCar, SilkRuntime silkRuntime) {
        final int silkCarRow = silkCar.getRow();
        final int silkCarCol = silkCar.getCol();
        final int oneSideCount = silkCarRow * silkCarCol;
        final int row = silkRuntime.getRow();
        final int col = silkRuntime.getCol();
        final int sidePosition = (row - 1) * silkCarCol + col;
        final int result = silkRuntime.getSideType() == SilkCarSideType.A ? sidePosition : (oneSideCount + sidePosition);
        return "" + result;
    }

    @Override
    public String handle(Principal principal, JikonAdapterSilkDetachEvent.Command command) {
        final JikonAdapterSilkDetachEvent event = new JikonAdapterSilkDetachEvent();
        event.setCommand(MAPPER.convertValue(this, JsonNode.class));
        final Operator operator = operatorRepository.find(principal);
        event.fire(operator);
        final SilkCarRuntime silkCarRuntime = silkCarRecordRepository.findSilkCarRuntime(command.getSilkcarCode()).get();
        silkCarRecordRepository.addEventSource(silkCarRuntime, event);
        return JikonUtil.ok();
    }

    @SneakyThrows
    @Override
    public String handle(Principal principal, JikonAdapterPackageBoxEvent.Command command) {
        final var packageClassMap = packageClassRepository.list().collect(toMap(PackageClass::getRiambCode, Function.identity()))
                .run().toCompletableFuture().get();
        final var gradeMap = gradeRepository.list().collect(toMap(Grade::getName, Function.identity()))
                .run().toCompletableFuture().get();
        final PackageBox packageBox = new PackageBox();
        packageBox.setType(PackageBoxType.AUTO);
        packageBox.command(MAPPER.convertValue(command, JsonNode.class));
        packageBox.setCode(command.getBoxCode());
        packageBox.setNetWeight(Double.parseDouble(command.getNetWeight()));
        packageBox.setGrossWeight(Double.parseDouble(command.getGrossWeight()));
        packageBox.setAutomaticPackeLine(command.getAutomaticPackeLine());
        packageBox.setPrintDate(new Date());
        packageBox.setPalletCode(command.getPalletCode());
        final PackageClass printClass = packageClassMap.get(command.getClassno());
        packageBox.setPrintClass(printClass);
        final Grade grade = gradeMap.get(command.getGrade());
        packageBox.setGrade(grade);
        final List<Silk> silks = command.getSpindle().parallelStream()
                .map(it -> silkRepository.findByCode(it.getSpindleCode()))
                .map(Optional::get)
                .peek(silk -> {
                    silk.setGrade(packageBox.getGrade());
                    silk.setPackageBox(packageBox);
                    silk.setPackageDateTime(packageBox.getPrintDate());
                })
                .collect(toList());
        packageBox.setSilks(silks);
        packageBox.setSilkCount(silks.size());
        final Set<Batch> batches = J.emptyIfNull(silks).stream().map(Silk::getBatch).collect(Collectors.toSet());
        if (batches.size() == 1) {
            final Batch batch = IterableUtils.get(batches, 0);
            packageBox.setBatch(batch);
        } else {
            log.error("PackageBox[" + packageBox.getCode() + "],混批!");
        }
        final Operator operator = operatorRepository.find(principal);
        packageBox.log(operator);
        packageBoxRepository.save(packageBox);
        silks.forEach(silkRepository::save);
        return JikonUtil.ok();
    }

}
