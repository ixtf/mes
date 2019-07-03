package com.hengyi.japp.mes.auto.application;

import com.github.ixtf.japp.core.J;
import com.hengyi.japp.mes.auto.application.command.PackageBoxAppendCommand;
import com.hengyi.japp.mes.auto.application.command.PackageBoxBatchPrintUpdateCommand;
import com.hengyi.japp.mes.auto.application.command.PackageBoxMeasureInfoUpdateCommand;
import com.hengyi.japp.mes.auto.application.event.PackageBoxEvent;
import com.hengyi.japp.mes.auto.domain.PackageBox;

import java.security.Principal;
import java.time.LocalDate;
import java.util.Date;

/**
 * @author jzb 2018-06-22
 */
public interface PackageBoxService {

    static String key(LocalDate ld) {
        return "PackageBoxIncr[" + ld + "]";
    }

    static String key() {
        return key(LocalDate.now());
    }

    static String key(Date date) {
        return key(J.localDate(date));
    }

    PackageBox handle(Principal principal, PackageBoxEvent.ManualCommandSimple command);

    PackageBox handle(Principal principal, PackageBoxEvent.TemporaryBoxCommand command);

    PackageBox update(Principal principal, String id, PackageBoxMeasureInfoUpdateCommand command);

    PackageBox print(Principal principal, String id);

    void print(Principal principal, PackageBoxBatchPrintUpdateCommand command);

    void delete(Principal principal, String id);

    PackageBox handle(Principal principal, PackageBoxAppendCommand command);
}
