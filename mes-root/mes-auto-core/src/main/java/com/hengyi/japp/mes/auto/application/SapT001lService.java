package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.SapT001lUpdateCommand;
import com.hengyi.japp.mes.auto.domain.SapT001l;

/**
 * @author jzb 2018-11-11
 */
public interface SapT001lService {

    SapT001l create(SapT001lUpdateCommand command);

}
