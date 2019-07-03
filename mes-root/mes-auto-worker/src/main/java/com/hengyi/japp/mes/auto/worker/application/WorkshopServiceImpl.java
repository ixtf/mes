package com.hengyi.japp.mes.auto.worker.application;

import com.github.ixtf.japp.core.J;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.WorkshopService;
import com.hengyi.japp.mes.auto.application.command.WorkshopUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.domain.SapT001l;
import com.hengyi.japp.mes.auto.domain.Workshop;
import com.hengyi.japp.mes.auto.repository.CorporationRepository;
import com.hengyi.japp.mes.auto.repository.OperatorRepository;
import com.hengyi.japp.mes.auto.repository.SapT001lRepository;
import com.hengyi.japp.mes.auto.repository.WorkshopRepository;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
public class WorkshopServiceImpl implements WorkshopService {
    private final WorkshopRepository workshopRepository;
    private final CorporationRepository corporationRepository;
    private final OperatorRepository operatorRepository;
    private final SapT001lRepository sapT001lRepository;

    @Inject
    private WorkshopServiceImpl(WorkshopRepository workshopRepository, CorporationRepository corporationRepository, OperatorRepository operatorRepository, SapT001lRepository sapT001lRepository) {
        this.workshopRepository = workshopRepository;
        this.corporationRepository = corporationRepository;
        this.operatorRepository = operatorRepository;
        this.sapT001lRepository = sapT001lRepository;
    }

    @Override
    public Workshop create(Principal principal, WorkshopUpdateCommand command) {
        return save(principal, new Workshop(), command);
    }

    private Workshop save(Principal principal, Workshop workshop, WorkshopUpdateCommand command) {
        workshop.setCode(command.getCode());
        workshop.setName(command.getName());
        workshop.setNote(command.getNote());
        List<SapT001l> sapT001ls = J.emptyIfNull(command.getSapT001ls())
                .parallelStream()
                .map(sapT001lRepository::find)
                .flatMap(Optional::stream)
                .collect(Collectors.toList());
        workshop.setSapT001ls(sapT001ls);
        sapT001ls = J.emptyIfNull(command.getSapT001lsForeign())
                .parallelStream()
                .map(sapT001lRepository::find)
                .flatMap(Optional::stream)
                .collect(Collectors.toList());
        workshop.setSapT001lsForeign(sapT001ls);
        sapT001ls = J.emptyIfNull(command.getSapT001lsPallet())
                .parallelStream()
                .map(sapT001lRepository::find)
                .flatMap(Optional::stream)
                .collect(Collectors.toList());
        workshop.setSapT001lsPallet(sapT001ls);
        corporationRepository.find(command.getCorporation()).ifPresent(workshop::setCorporation);
        final Operator operator = operatorRepository.find(principal);
        workshop.log(operator);
        return workshopRepository.save(workshop);
    }

    @Override
    public Workshop update(Principal principal, String id, WorkshopUpdateCommand command) {
        return save(principal, workshopRepository.find(id).get(), command);
    }

}
