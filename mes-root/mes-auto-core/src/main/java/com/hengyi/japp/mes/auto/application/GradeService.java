package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.GradeUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Grade;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
public interface GradeService {

    Grade create(Principal principal, GradeUpdateCommand command);

    Grade update(Principal principal, String id, GradeUpdateCommand command);
}
