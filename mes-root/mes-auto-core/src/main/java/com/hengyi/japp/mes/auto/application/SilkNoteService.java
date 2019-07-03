package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.SilkNoteUpdateCommand;
import com.hengyi.japp.mes.auto.domain.SilkNote;

import java.security.Principal;

/**
 * @author jzb 2018-06-21
 */
public interface SilkNoteService {

    SilkNote create(Principal principal, SilkNoteUpdateCommand command);

    SilkNote update(Principal principal, String id, SilkNoteUpdateCommand command);
}
