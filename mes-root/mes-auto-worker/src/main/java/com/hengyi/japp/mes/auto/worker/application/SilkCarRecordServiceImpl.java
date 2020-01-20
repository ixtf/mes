package com.hengyi.japp.mes.auto.worker.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.SilkCarRecordService;
import com.hengyi.japp.mes.auto.domain.data.DoffingType;
import com.hengyi.japp.mes.auto.event.EventSource;
import com.hengyi.japp.mes.auto.event.SilkCarRuntimeInitEvent;
import com.hengyi.japp.mes.auto.repository.*;
import lombok.extern.slf4j.Slf4j;

import javax.validation.constraints.NotNull;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
public class SilkCarRecordServiceImpl implements SilkCarRecordService {
    private final SilkCarRecordRepository silkCarRecordRepository;
    private final SilkCarRepository silkCarRepository;
    private final SilkRepository silkRepository;
    private final LineRepository lineRepository;
    private final LineMachineRepository lineMachineRepository;
    private final BatchRepository batchRepository;
    private final GradeRepository gradeRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private SilkCarRecordServiceImpl(SilkCarRecordRepository silkCarRecordRepository, SilkCarRepository silkCarRepository, SilkRepository silkRepository, LineRepository lineRepository, LineMachineRepository lineMachineRepository, BatchRepository batchRepository, GradeRepository gradeRepository, OperatorRepository operatorRepository) {
        this.silkCarRecordRepository = silkCarRecordRepository;
        this.silkCarRepository = silkCarRepository;
        this.silkRepository = silkRepository;
        this.lineRepository = lineRepository;
        this.lineMachineRepository = lineMachineRepository;
        this.batchRepository = batchRepository;
        this.gradeRepository = gradeRepository;
        this.operatorRepository = operatorRepository;
    }

    @Override
    public SilkCarRecord save(SilkCarRuntime silkCarRuntime) {
        final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
        silkCarRecord.setEndDateTime(new Date());
        silkCarRecord.events(silkCarRuntime.getEventSources());
        return silkCarRecordRepository.save(silkCarRecord);
    }

    @Override
    public List<EventSource> listCardEvent(JsonNode jsonNode) {
        return null;
    }

    @Override
    public void handle(SilkCarRuntimeInitEvent.AutoDoffingSilkCarRuntimeCreateCommand command) {
        final String silkCarRecordId = command.getId();
        final Optional<SilkCarRecord> optional = silkCarRecordRepository.find(silkCarRecordId);
        if (optional.isPresent()) {
            return;
        }
        final SilkCarRuntimeInitEvent event = new SilkCarRuntimeInitEvent();
        event.fire(operatorRepository.find(command.getPrincipalName()).get());
        event.setCommand(MAPPER.convertValue(command, JsonNode.class));
        final var silkCarInfo = command.getSilkCarInfo();
        final SilkCar silkCar = silkCarRepository.findByCode(silkCarInfo.getCode()).get();
        event.setSilkCar(silkCar);
        final Batch batch = batchRepository.findByBatchNo(silkCarInfo.getBatchNo()).get();
        final Grade grade = gradeRepository.findByName(silkCarInfo.getGrade()).get();
        event.setGrade(grade);
        final Collection<SilkRuntime> silkRuntimes = silkRuntimeStream(event, command.getSilkInfos())
                .peek(silkRuntime -> {
                    final Silk silk = silkRuntime.getSilk();
                    silk.setBatch(batch);
                })
                .collect(Collectors.toList());
        event.setSilkRuntimes(silkRuntimes);
        final SilkCarRecord silkCarRecord = new SilkCarRecord();
        silkCarRecord.setId(silkCarRecordId);
        create(silkCarRecord, event);
    }

    private SilkCarRuntime create(SilkCarRecord silkCarRecord, SilkCarRuntimeInitEvent event) {
        silkCarRecord.setSilkCar(event.getSilkCar());
        silkCarRecord.setGrade(event.getGrade());
        @NotNull final Batch batch = event.getSilkRuntimes().parallelStream().map(SilkRuntime::getSilk).map(Silk::getBatch).findAny().get();
        silkCarRecord.setBatch(batch);
        silkCarRecord.setDoffingType(DoffingType.AUTO);
        silkCarRecord.setDoffingOperator(event.getOperator());
        silkCarRecord.setDoffingDateTime(event.getFireDateTime());
        silkCarRecord.initEvent(event);

        final SilkCarRuntime silkCarRuntime = new SilkCarRuntime();
        silkCarRuntime.setSilkCarRecord(silkCarRecord);
        silkCarRuntime.setSilkRuntimes(event.getSilkRuntimes());
        return silkCarRuntime;
    }

    private Stream<SilkRuntime> silkRuntimeStream(SilkCarRuntimeInitEvent event, Collection<SilkCarRuntimeInitEvent.AutoDoffingSilkCarRuntimeCreateCommand.SilkInfo> silkInfos) {
        return silkInfos.parallelStream().map(silkInfo -> {
            final SilkRuntime silkRuntime = new SilkRuntime();
            final Silk silk = new Silk();
            silkRuntime.setSilk(silk);
            silkRuntime.setSideType(silkInfo.getSideType());
            silkRuntime.setRow(silkInfo.getRow());
            silkRuntime.setCol(silkInfo.getCol());
            silk.setDoffingType(DoffingType.AUTO);
            silk.setDoffingOperator(event.getOperator());
            silk.setDoffingDateTime(silkInfo.getDoffingDateTime());
            silk.setLineMachine(findByLineNameAndItem(silkInfo.getLine(), silkInfo.getLineMachine()));
            silk.setSpindle(silkInfo.getSpindle());
            silk.setGrade(event.getGrade());
            return silkRuntime;
        });
    }

    private Collection<SilkRuntime> code(Collection<SilkRuntime> silkRuntimes) {
        return silkRuntimes;
    }

    private LineMachine findByLineNameAndItem(String lineName, int lineMachineItem) {
        return lineRepository.findByName(lineName)
                .flatMap(it -> lineMachineRepository.find(it, lineMachineItem))
                .get();
    }

}
