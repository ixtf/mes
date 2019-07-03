package com.hengyi.japp.mes.auto.worker.application;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.SilkService;
import com.hengyi.japp.mes.auto.application.command.SilkInspectionExceptionUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Grade;
import com.hengyi.japp.mes.auto.domain.Silk;
import com.hengyi.japp.mes.auto.domain.SilkException;
import com.hengyi.japp.mes.auto.repository.GradeRepository;
import com.hengyi.japp.mes.auto.repository.OperatorRepository;
import com.hengyi.japp.mes.auto.repository.SilkExceptionRepository;
import com.hengyi.japp.mes.auto.repository.SilkRepository;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
@Slf4j
@Singleton
public class SilkServiceImpl implements SilkService {
    private final SilkRepository silkRepository;
    private final SilkExceptionRepository silkExceptionRepository;
    private final GradeRepository gradeRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private SilkServiceImpl(SilkRepository silkRepository, SilkExceptionRepository silkExceptionRepository, GradeRepository gradeRepository, OperatorRepository operatorRepository) {
        this.silkRepository = silkRepository;
        this.silkExceptionRepository = silkExceptionRepository;
        this.gradeRepository = gradeRepository;
        this.operatorRepository = operatorRepository;
    }

    @Override
    public Silk update(Principal principal, String id, SilkInspectionExceptionUpdateCommand command) {
        final Silk silk = silkRepository.find(id).get();
        final SilkException silkException = silkExceptionRepository.find(command.getException()).get();
        silk.setException(silkException);
        final Grade grade = gradeRepository.find(command.getGrade()).get();
        silk.setGrade(grade);
        return silkRepository.save(silk);
    }
}
