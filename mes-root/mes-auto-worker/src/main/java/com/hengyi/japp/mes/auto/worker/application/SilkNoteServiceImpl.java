package com.hengyi.japp.mes.auto.worker.application;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.SilkNoteService;
import com.hengyi.japp.mes.auto.application.command.SilkNoteUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.domain.SilkNote;
import com.hengyi.japp.mes.auto.repository.OperatorRepository;
import com.hengyi.japp.mes.auto.repository.SilkNoteRepository;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
@Slf4j
@Singleton
public class SilkNoteServiceImpl implements SilkNoteService {
    private final SilkNoteRepository silkNoteRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private SilkNoteServiceImpl(SilkNoteRepository silkNoteRepository, OperatorRepository operatorRepository) {
        this.silkNoteRepository = silkNoteRepository;
        this.operatorRepository = operatorRepository;
    }

    @Override
    public SilkNote create(Principal principal, SilkNoteUpdateCommand command) {
        return save(principal, new SilkNote(), command);
    }

    private SilkNote save(Principal principal, SilkNote silkNote, SilkNoteUpdateCommand command) {
        silkNote.setName(command.getName());
        silkNote.setMustFeedback(command.isMustFeedback());
        final Operator operator = operatorRepository.find(principal);
        silkNote.log(operator);
        return silkNoteRepository.save(silkNote);
    }

    @Override
    public SilkNote update(Principal principal, String id, SilkNoteUpdateCommand command) {
        return save(principal, silkNoteRepository.find(id).get(), command);
    }

}
