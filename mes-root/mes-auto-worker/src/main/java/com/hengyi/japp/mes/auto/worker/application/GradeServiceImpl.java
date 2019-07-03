package com.hengyi.japp.mes.auto.worker.application;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.GradeService;
import com.hengyi.japp.mes.auto.application.command.GradeUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Grade;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.repository.GradeRepository;
import com.hengyi.japp.mes.auto.repository.OperatorRepository;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
@Slf4j
@Singleton
public class GradeServiceImpl implements GradeService {
    private final GradeRepository gradeRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private GradeServiceImpl(GradeRepository gradeRepository, OperatorRepository operatorRepository) {
        this.gradeRepository = gradeRepository;
        this.operatorRepository = operatorRepository;
    }

    @Override
    public Grade create(Principal principal, GradeUpdateCommand command) {
        return save(principal, new Grade(), command);
    }

    private Grade save(Principal principal, Grade grade, GradeUpdateCommand command) {
        final Operator operator = operatorRepository.find(principal);
        grade.setName(command.getName());
        grade.setCode(command.getCode());
        grade.setSortBy(command.getSortBy());
        grade.log(operator);
        return gradeRepository.save(grade);
    }

    @Override
    public Grade update(Principal principal, String id, GradeUpdateCommand command) {
        return save(principal, gradeRepository.find(id).get(), command);
    }
}
