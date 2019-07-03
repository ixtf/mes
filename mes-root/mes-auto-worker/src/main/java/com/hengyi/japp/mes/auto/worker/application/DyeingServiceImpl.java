package com.hengyi.japp.mes.auto.worker.application;

import com.github.ixtf.japp.core.J;
import com.google.common.collect.Lists;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.ApplicationEvents;
import com.hengyi.japp.mes.auto.application.ApplicationEvents.CURDType;
import com.hengyi.japp.mes.auto.application.DyeingService;
import com.hengyi.japp.mes.auto.application.command.DyeingResultUpdateCommand;
import com.hengyi.japp.mes.auto.domain.*;
import com.hengyi.japp.mes.auto.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;

import java.security.Principal;
import java.util.*;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toList;

/**
 * @author jzb 2018-08-08
 */
@Slf4j
@Singleton
public class DyeingServiceImpl implements DyeingService {
    private final ApplicationEvents applicationEvents;
    private final DyeingPrepareRepository dyeingPrepareRepository;
    private final DyeingResultRepository dyeingResultRepository;
    private final OperatorRepository operatorRepository;
    private final GradeRepository gradeRepository;
    private final SilkExceptionRepository silkExceptionRepository;
    private final SilkNoteRepository silkNoteRepository;
    private final LineMachineRepository lineMachineRepository;

    @Inject
    private DyeingServiceImpl(ApplicationEvents applicationEvents, DyeingPrepareRepository dyeingPrepareRepository, DyeingResultRepository dyeingResultRepository, OperatorRepository operatorRepository, GradeRepository gradeRepository, SilkExceptionRepository silkExceptionRepository, SilkNoteRepository silkNoteRepository, LineMachineRepository lineMachineRepository) {
        this.applicationEvents = applicationEvents;
        this.dyeingPrepareRepository = dyeingPrepareRepository;
        this.dyeingResultRepository = dyeingResultRepository;
        this.operatorRepository = operatorRepository;
        this.gradeRepository = gradeRepository;
        this.silkExceptionRepository = silkExceptionRepository;
        this.silkNoteRepository = silkNoteRepository;
        this.lineMachineRepository = lineMachineRepository;
    }

    @Override
    public DyeingPrepare create(Principal principal, DyeingPrepare dyeingPrepare, SilkCarRuntime silkCarRuntime, Collection<SilkRuntime> silkRuntimes) {
        final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
        final Collection<Silk> silks = silkRuntimes.stream().map(SilkRuntime::getSilk).collect(toList());
        dyeingPrepare.setSilkCarRecord(silkCarRecord);
        dyeingPrepare.setSilks(silks);
        final List<DyeingResult> dyeingResults = createDyeingResults(dyeingPrepare, silkRuntimes);
        dyeingPrepare.setDyeingResults(dyeingResults);
        final DyeingPrepare result = dyeingPrepareRepository.save(dyeingPrepare);
        applicationEvents.fire(this, CURDType.CREATE, principal, null, result);
        return result;
    }

    private List<DyeingResult> createDyeingResults(DyeingPrepare dyeingPrepare, Collection<SilkRuntime> silkRuntimes) {
        return silkRuntimes.stream().map(silkRuntime -> {
            final Silk silk = silkRuntime.getSilk();
            final LineMachine lineMachine = silk.getLineMachine();
            final int spindle = silk.getSpindle();
            final Date dateTime = silk.getDoffingDateTime();
            final DyeingResult dyeingResult = new DyeingResult();
            dyeingResult.setId(new ObjectId().toHexString());
            dyeingResult.setDyeingPrepare(dyeingPrepare);
            dyeingResult.setSilk(silk);
            dyeingResult.setLineMachine(lineMachine);
            dyeingResult.setSpindle(spindle);
            dyeingResult.setDateTime(dateTime);
            return dyeingResultRepository.save(dyeingResult);
        }).collect(toList());
    }

    @Override
    public DyeingPrepare create(DyeingPrepare dyeingPrepare, SilkCarRuntime silkCarRuntime1, Collection<SilkRuntime> silkRuntimes1, SilkCarRuntime silkCarRuntime2, Collection<SilkRuntime> silkRuntimes2) {
        final SilkCarRecord silkCarRecord1 = silkCarRuntime1.getSilkCarRecord();
        final Collection<Silk> silks1 = silkRuntimes1.stream()
                .map(SilkRuntime::getSilk)
                .collect(toList());
        final SilkCarRecord silkCarRecord2 = silkCarRuntime2.getSilkCarRecord();
        final Collection<Silk> silks2 = silkRuntimes2.stream()
                .map(SilkRuntime::getSilk)
                .collect(toList());
        dyeingPrepare.setSilkCarRecord1(silkCarRecord1);
        dyeingPrepare.setSilks1(silks1);
        dyeingPrepare.setSilkCarRecord2(silkCarRecord2);
        dyeingPrepare.setSilks2(silks2);

        final List<SilkRuntime> silkRuntimes = Stream.concat(silkRuntimes1.stream(), silkRuntimes2.stream()).collect(toList());
        final List<DyeingResult> dyeingResults = createDyeingResults(dyeingPrepare, silkRuntimes);
        dyeingPrepare.setDyeingResults(dyeingResults);
        return dyeingPrepareRepository.save(dyeingPrepare);
    }

    @Override
    public void update(Principal principal, String id, DyeingResultUpdateCommand command) {
        final Date currentDateTime = new Date();
        final DyeingPrepare dyeingPrepare = dyeingPrepareRepository.find(id).get();
        final Operator operator = operatorRepository.find(principal);
        command.getItems().forEach(item -> {
            final DyeingResult dyeingResult = dyeingPrepare.getDyeingResults().stream()
                    .filter(it -> Objects.equals(item.getSilk().getId(), it.getSilk().getId()))
                    .findFirst().get();
            fillData(dyeingResult, item);
            dyeingResult.log(operator, currentDateTime);
        });
        dyeingPrepare.getDyeingResults().forEach(dyeingResultRepository::save);
        dyeingPrepare.setSubmitter(operator);
        dyeingPrepare.setSubmitDateTime(currentDateTime);
        dyeingPrepareRepository.save(dyeingPrepare);
    }

    private void fillData(DyeingResult dyeingResult, DyeingResultUpdateCommand.Item item) {
        dyeingResult.setHasException(item.isHasException());
        dyeingResult.formConfig(item.getFormConfig());
        dyeingResult.formConfigValueData(item.getFormConfigValueData());
        gradeRepository.find(item.getGrade()).ifPresent(dyeingResult::setGrade);
        final List<SilkException> silkExceptions = J.emptyIfNull(item.getSilkExceptions()).stream()
                .map(silkExceptionRepository::find)
                .flatMap(Optional::stream)
                .collect(toList());
        dyeingResult.setSilkExceptions(silkExceptions);
        final List<SilkNote> silkNotes = J.emptyIfNull(item.getSilkNotes()).stream()
                .map(silkNoteRepository::find)
                .flatMap(Optional::stream)
                .collect(toList());
        dyeingResult.setSilkNotes(silkNotes);
    }

    @Override
    public void update(Principal principal, String id, String dyeingResultId, DyeingResultUpdateCommand.Item command) {
        final Operator operator = operatorRepository.find(principal);
        final DyeingPrepare dyeingPrepare = dyeingPrepareRepository.find(id).get();
        final DyeingResult dyeingResult = dyeingPrepare.getDyeingResults().stream()
                .filter(it -> Objects.equals(it.getId(), dyeingResultId))
                .findFirst().get();
        fillData(dyeingResult, command);
        dyeingResult.log(operator);
        dyeingResultRepository.save(dyeingResult);
    }

    @Override
    public List<DyeingResult> listTimeline(String type, String currentId, String lineMachineId, int spindle, int size) {
        final Optional<DyeingResult> dyeingResultOptional = null;
//        if (J.nonBlank(currentId)) {
//            dyeingResultOptional = dyeingResultRepository.find(currentId);
//        } else {
//            final LineMachine lineMachine = lineMachineRepository.find(lineMachineId).get();
//            switch (type) {
//                case "FIRST":
//                    dyeingResultOptional = redisService.latestDyeingResult_FIRST(lineMachine, spindle);
//                    break;
//                default:
//                    dyeingResultOptional = redisService.latestDyeingResult_CROSS(lineMachine, spindle);
//                    break;
//            }
//        }
        return dyeingResultOptional.map(dyeingResult -> {
            final List<DyeingResult> dyeingResults = Lists.newArrayList(dyeingResult);
            DyeingResult prev = dyeingResult;
            for (int i = 0; i < size; i++) {
                prev = prev.getPrev();
                if (prev == null) {
                    break;
                }
                dyeingResults.add(prev);
            }
            return dyeingResults;
        }).orElse(Collections.EMPTY_LIST);
    }

}
