package com.hengyi.japp.mes.auto.worker.application;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.SapT001lService;
import com.hengyi.japp.mes.auto.application.command.SapT001lUpdateCommand;
import com.hengyi.japp.mes.auto.domain.SapT001l;
import com.hengyi.japp.mes.auto.repository.SapT001lRepository;
import lombok.extern.slf4j.Slf4j;

/**
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
public class SapT001lServiceImpl implements SapT001lService {
    private final SapT001lRepository sapT001lRepository;

    @Inject
    private SapT001lServiceImpl(SapT001lRepository sapT001lRepository) {
        this.sapT001lRepository = sapT001lRepository;
    }

    @Override
    public SapT001l create(SapT001lUpdateCommand command) {
        final SapT001l sapT001l = sapT001lRepository.find(command.getLgort()).orElse(new SapT001l());
        sapT001l.setId(command.getLgort());
        sapT001l.setLgort(command.getLgort());
        sapT001l.setLgobe(command.getLgobe());
        return sapT001lRepository.save(sapT001l);
    }

}
