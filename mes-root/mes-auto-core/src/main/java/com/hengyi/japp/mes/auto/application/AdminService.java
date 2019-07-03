package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.event.SilkCarRuntimeInitEvent;
import com.hengyi.japp.mes.auto.domain.SilkCarRuntime;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
public interface AdminService {

    SilkCarRuntime handle(Principal principal, SilkCarRuntimeInitEvent.AdminManualDoffingCommand command);

    void deleteSilkCarRecord(Principal principal, String id);
}
