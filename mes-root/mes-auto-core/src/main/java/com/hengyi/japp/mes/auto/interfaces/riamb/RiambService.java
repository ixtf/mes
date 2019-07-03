package com.hengyi.japp.mes.auto.interfaces.riamb;

import com.hengyi.japp.mes.auto.interfaces.riamb.dto.RiambFetchSilkCarRecordResultDTO;
import com.hengyi.japp.mes.auto.interfaces.riamb.event.RiambPackageBoxEvent;
import com.hengyi.japp.mes.auto.interfaces.riamb.event.RiambSilkDetachEvent;
import com.sun.security.auth.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.Principal;

/**
 * 北自所接口
 *
 * @author jzb 2018-06-25
 */
public interface RiambService {
    Logger LOG = LoggerFactory.getLogger(RiambService.class);
    Principal PRINCIPAL = new UserPrincipal("if_riamb");

    RiambFetchSilkCarRecordResultDTO fetchSilkCarRecord(Principal principal, String code);

    void silkDetach(Principal principal, RiambSilkDetachEvent.Command command);

    void packageBox(Principal principal, RiambPackageBoxEvent.Command command);
}
