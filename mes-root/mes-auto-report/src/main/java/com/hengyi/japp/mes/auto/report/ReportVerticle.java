package com.hengyi.japp.mes.auto.report;

import io.vertx.core.AbstractVerticle;

//import com.hengyi.japp.mes.auto.report.application.StrippingReportService;

/**
 * @author jzb 2019-05-20
 */
public class ReportVerticle extends AbstractVerticle {

    @Override
    public void start() {
        vertx.eventBus().consumer("test:ReportService:action1", reply -> {
            reply.reply("test:ReportService:action1");
        });
    }

}
