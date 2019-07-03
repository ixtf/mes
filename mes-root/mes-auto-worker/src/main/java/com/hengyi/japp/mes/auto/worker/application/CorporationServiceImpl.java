package com.hengyi.japp.mes.auto.worker.application;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.CorporationService;
import com.hengyi.japp.mes.auto.application.command.CorporationUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Corporation;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.repository.CorporationRepository;
import com.hengyi.japp.mes.auto.repository.OperatorRepository;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;

/**
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
public class CorporationServiceImpl implements CorporationService {
    private final CorporationRepository corporationRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private CorporationServiceImpl(CorporationRepository corporationRepository, OperatorRepository operatorRepository) {
        this.corporationRepository = corporationRepository;
        this.operatorRepository = operatorRepository;
    }

    @Override
    public Corporation create(Principal principal, CorporationUpdateCommand command) {
        return save(principal, new Corporation(), command);
    }

    private Corporation save(Principal principal, Corporation corporation, CorporationUpdateCommand command) {
        corporation.setCode(command.getCode());
        corporation.setName(command.getName());
        final Operator operator = operatorRepository.find(principal);
        corporation.log(operator);
        return corporationRepository.save(corporation);
    }

    @Override
    public Corporation update(Principal principal, String id, CorporationUpdateCommand command) {
        final Corporation corporation = corporationRepository.find(id).get();
        return save(principal, corporation, command);
    }

}
