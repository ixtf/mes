package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.BatchUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Batch;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
public interface BatchService {
    Batch create(Principal principal, BatchUpdateCommand command);

    Batch update(Principal principal, String id, BatchUpdateCommand command);
}
