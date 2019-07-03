package com.hengyi.japp.mes.auto.worker.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.github.ixtf.japp.core.exception.JAuthorizationException;
import com.google.common.collect.ImmutableList;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.AdminService;
import com.hengyi.japp.mes.auto.application.SilkCarRuntimeService;
import com.hengyi.japp.mes.auto.application.event.SilkCarRuntimeInitEvent;
import com.hengyi.japp.mes.auto.domain.*;
import com.hengyi.japp.mes.auto.dto.CheckSilkDTO;
import com.hengyi.japp.mes.auto.repository.GradeRepository;
import com.hengyi.japp.mes.auto.repository.OperatorRepository;
import com.hengyi.japp.mes.auto.repository.PackageBoxRepository;
import com.hengyi.japp.mes.auto.repository.SilkCarRepository;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;
import java.util.List;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2018-06-22
 */
@Slf4j
@Singleton
public class AdminServiceImpl implements AdminService {
    private final SilkCarRuntimeService silkCarRuntimeService;
    private final SilkCarRepository silkCarRepository;
    private final GradeRepository gradeRepository;
    private final PackageBoxRepository packageBoxRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private AdminServiceImpl(SilkCarRuntimeService silkCarRuntimeService, SilkCarRepository silkCarRepository, GradeRepository gradeRepository, PackageBoxRepository packageBoxRepository, OperatorRepository operatorRepository) {
        this.silkCarRuntimeService = silkCarRuntimeService;
        this.silkCarRepository = silkCarRepository;
        this.gradeRepository = gradeRepository;
        this.packageBoxRepository = packageBoxRepository;
        this.operatorRepository = operatorRepository;
    }

    @SneakyThrows
    private Operator checkAdmin(Principal principal) {
        final Operator operator = operatorRepository.find(principal);
        if (!operator.isAdmin()) {
            throw new JAuthorizationException();
        }
        return operator;
    }

    @Override
    public SilkCarRuntime handle(Principal principal, SilkCarRuntimeInitEvent.AdminManualDoffingCommand command) {
        final Operator operator = checkAdmin(principal);
        final SilkCarRuntimeInitEvent event = new SilkCarRuntimeInitEvent();
        event.setCommand(MAPPER.convertValue(command, JsonNode.class));
        final SilkCar silkCar = silkCarRepository.findByCode(command.getSilkCar()).get();
        event.setSilkCar(silkCar);
        final AdminManualSilkCarModel silkCarModel = new AdminManualSilkCarModel(silkCar, command.getCheckSilks().size());
        final List<SilkRuntime> silkRuntimes = silkCarModel.generateSilkRuntimes(command.getCheckSilks());
        event.setSilkRuntimes(silkRuntimes);
        final Grade grade = gradeRepository.find(command.getGrade()).get();
        event.setGrade(grade);
        event.fire(operator);
//        return silkCarRuntimeService.doffing(event, DoffingType.MANUAL);
        return null;
    }

    private class AdminManualSilkCarModel extends ManualSilkCarModel {
        private AdminManualSilkCarModel(SilkCar silkCar, float count) {
            super(silkCar, count);
        }

        @Override
        public List<SilkRuntime> generateSilkRuntimes(List<CheckSilkDTO> checkSilks) {
            final List<SilkBarcode> silkBarcodes = toSilkBarcodes(checkSilks);
            final List<SilkRuntime> silkRuntimes = generateSilkRuntimesBySilkBarcodes(ImmutableList.builder(), silkBarcodes);
            checkPosition(silkRuntimes, checkSilks);
            return silkRuntimes;
        }
    }
}
