package com.hengyi.japp.mes.auto.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.hengyi.japp.mes.auto.application.event.EventSource;
import com.hengyi.japp.mes.auto.application.event.SilkCarRuntimeInitEvent;
import com.hengyi.japp.mes.auto.domain.SilkCarRecord;
import com.hengyi.japp.mes.auto.domain.SilkCarRuntime;

import java.util.List;

/**
 * @author jzb 2018-06-22
 */
public interface SilkCarRecordService {

    SilkCarRecord save(SilkCarRuntime silkCarRuntime);

    List<EventSource> listCardEvent(JsonNode jsonNode);

    void handle(SilkCarRuntimeInitEvent.AutoDoffingSilkCarRuntimeCreateCommand command);
}
