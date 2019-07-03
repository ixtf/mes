package com.hengyi.japp.mes.auto.worker.application;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.SilkCarService;
import com.hengyi.japp.mes.auto.application.command.SilkCarUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.domain.SilkCar;
import com.hengyi.japp.mes.auto.repository.OperatorRepository;
import com.hengyi.japp.mes.auto.repository.SilkCarRepository;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;
import java.util.Optional;

/**
 * @author jzb 2018-06-22
 */
@Slf4j
@Singleton
public class SilkCarServiceImpl implements SilkCarService {
    private final SilkCarRepository silkCarRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private SilkCarServiceImpl(SilkCarRepository silkCarRepository, OperatorRepository operatorRepository) {
        this.silkCarRepository = silkCarRepository;
        this.operatorRepository = operatorRepository;
    }

    @Override
    public SilkCar create(Principal principal, SilkCarUpdateCommand command) {
        final Optional<SilkCar> optional = silkCarRepository.findByCode(command.getCode());
        if (optional.isPresent()) {
            throw new RuntimeException("丝车号重复");
        }
        return save(principal, new SilkCar(), command);
    }

    private SilkCar save(Principal principal, SilkCar silkCar, SilkCarUpdateCommand command) {
        silkCar.setNumber(command.getNumber());
        silkCar.setCode(command.getCode());
        silkCar.setRow(command.getRow());
        silkCar.setCol(command.getCol());
        silkCar.setType(command.getType());
        final Operator operator = operatorRepository.find(principal);
        silkCar.log(operator);
        return silkCarRepository.save(silkCar);
    }

    @Override
    public SilkCar update(Principal principal, String id, SilkCarUpdateCommand command) {
        return save(principal, silkCarRepository.find(id).get(), command);
    }
}
