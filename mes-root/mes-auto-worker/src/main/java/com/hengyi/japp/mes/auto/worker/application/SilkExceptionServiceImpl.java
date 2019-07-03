package com.hengyi.japp.mes.auto.worker.application;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.SilkExceptionService;
import com.hengyi.japp.mes.auto.application.command.SilkExceptionUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.domain.SilkException;
import com.hengyi.japp.mes.auto.repository.OperatorRepository;
import com.hengyi.japp.mes.auto.repository.SilkExceptionRepository;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
@Slf4j
@Singleton
public class SilkExceptionServiceImpl implements SilkExceptionService {
    private final SilkExceptionRepository silkExceptionRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private SilkExceptionServiceImpl(SilkExceptionRepository silkExceptionRepository, OperatorRepository operatorRepository) {
        this.silkExceptionRepository = silkExceptionRepository;
        this.operatorRepository = operatorRepository;
    }

    @Override
    public SilkException create(Principal principal, SilkExceptionUpdateCommand command) {
        return save(principal, new SilkException(), command);
    }

    private SilkException save(Principal principal, SilkException silkException, SilkExceptionUpdateCommand command) {
        silkException.setName(command.getName());
        final Operator operator = operatorRepository.find(principal);
        silkException.log(operator);
        return silkExceptionRepository.save(silkException);
    }

    @Override
    public SilkException update(Principal principal, String id, SilkExceptionUpdateCommand command) {
        return save(principal, silkExceptionRepository.find(id).get(), command);
    }

}
