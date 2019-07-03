package com.hengyi.japp.mes.auto.application;

import com.github.ixtf.persistence.IEntity;
import com.hengyi.japp.mes.auto.domain.LineMachineProductPlan;
import com.hengyi.japp.mes.auto.domain.SilkCarRuntime;
import com.hengyi.japp.mes.auto.interfaces.jikon.dto.GetSilkSpindleInfoDTO;
import com.hengyi.japp.mes.auto.interfaces.riamb.dto.RiambFetchSilkCarRecordResultDTO;
import lombok.Data;

import java.io.Serializable;
import java.security.Principal;
import java.util.Date;
import java.util.List;

/**
 * @author jzb 2018-06-25
 */
public interface ApplicationEvents {

    void fire(Object source, CURDType update, Principal principal, Object command, IEntity target);

    enum CURDType {
        CREATE, UPDATE, READ, DELETE
    }

    @Data
    class CURDMessage implements Serializable {
        private String source;
        private CURDType curdType;
        private String principal;
        private String command;
        private String targetClass;
        private String targetId;
        private Date dateTime;
    }

    void fire(LineMachineProductPlan lineMachineProductPlan);

    void fire(SilkCarRuntime silkCarRuntime, GetSilkSpindleInfoDTO dto, List<String> reasons);

    void fire(SilkCarRuntime silkCarRuntime, RiambFetchSilkCarRecordResultDTO dto, List<String> reasons);
}
