package com.hengyi.japp.mes.auto.worker.application;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.LineService;
import com.hengyi.japp.mes.auto.application.command.LineUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Line;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.domain.Workshop;
import com.hengyi.japp.mes.auto.repository.LineRepository;
import com.hengyi.japp.mes.auto.repository.OperatorRepository;
import com.hengyi.japp.mes.auto.repository.WorkshopRepository;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;

/**
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
public class LineServiceImpl implements LineService {
    private final LineRepository lineRepository;
    private final WorkshopRepository workshopRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private LineServiceImpl(LineRepository lineRepository, WorkshopRepository workshopRepository, OperatorRepository operatorRepository) {
        this.lineRepository = lineRepository;
        this.workshopRepository = workshopRepository;
        this.operatorRepository = operatorRepository;
    }

    @Override
    public Line create(Principal principal, LineUpdateCommand command) {
        return save(principal, new Line(), command);
    }

    private Line save(Principal principal, Line line, LineUpdateCommand command) {
        line.setName(command.getName());
        line.setDoffingType(command.getDoffingType());
        final Workshop workshop = workshopRepository.find(command.getWorkshop()).get();
        line.setWorkshop(workshop);
        final Operator operator = operatorRepository.find(principal);
        line.log(operator);
        return lineRepository.save(line);
    }

    @Override
    public Line update(Principal principal, String id, LineUpdateCommand command) {
        return save(principal, lineRepository.find(id).get(), command);
    }

}
