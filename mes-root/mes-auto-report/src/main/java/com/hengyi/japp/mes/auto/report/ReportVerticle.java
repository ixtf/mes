package com.hengyi.japp.mes.auto.report;

import io.vertx.core.AbstractVerticle;

//import com.hengyi.japp.mes.auto.report.application.StrippingReportService;

/**
 * @author jzb 2019-05-20
 */
public class ReportVerticle extends AbstractVerticle {

    @Override
    public void start() {
//        return Completable.mergeArray(
//                vertx.eventBus().consumer("mes-auto:report:dyeingReport", dyeingReportService::dyeingReport).rxCompletionHandler(),
////                vertx.eventBus().consumer("mes-auto:report:strippingReport", strippingReportService::strippingReport).rxCompletionHandler(),
//                vertx.eventBus().consumer("mes-auto:report:measureFiberReport", measureFiberReportService::measureFiberReport).rxCompletionHandler(),
//                vertx.eventBus().consumer("mes-auto:report:silkExceptionReport", silkExceptionReportService::silkExceptionReport).rxCompletionHandler(),
//                vertx.eventBus().consumer("mes-auto:report:packagePlanBoard", packagePlanService::packagePlanBoard).rxCompletionHandler(),
//                vertx.eventBus().<String>consumer("mes-auto:report:statisticReport:generate", reply -> Single.just(reply.body()).map(MAPPER::readTree).map(jsonNode -> {
//                            final String workshopId = jsonNode.get("workshopId").asText(null);
//                            final LocalDate ld = LocalDate.parse(jsonNode.get("date").asText(null));
//                            final StatisticReportDay report = statisticReportService.generate(workshopId, ld).block();
//                            return MAPPER.writeValueAsString(report);
//                        }).subscribe(reply::reply, err -> reply.fail(400, err.getLocalizedMessage()))
//                ).rxCompletionHandler(),
//
//                vertx.eventBus().<String>consumer("mes-auto:report:statisticReport:fromDisk", reply -> Single.just(reply.body()).map(MAPPER::readTree).map(jsonNode -> {
//                            final String workshopId = jsonNode.get("workshopId").asText(null);
//                            final LocalDate ld = LocalDate.parse(jsonNode.get("date").asText(null));
//                            final StatisticReportDay report = statisticReportService.fromDisk(workshopId, ld).block();
//                            return MAPPER.writeValueAsString(report);
//                        }).subscribe(reply::reply, err -> reply.fail(400, err.getLocalizedMessage()))
//                ).rxCompletionHandler(),
//
//                vertx.eventBus().<String>consumer("mes-auto:report:statisticReport:rangeDisk", reply -> Single.just(reply.body()).map(MAPPER::readTree).map(jsonNode -> {
//                            final String workshopId = jsonNode.get("workshopId").asText(null);
//                            final LocalDate startLd = LocalDate.parse(jsonNode.get("startDate").asText(null));
//                            final LocalDate endLd = LocalDate.parse(jsonNode.get("endDate").asText(null));
//                            final StatisticReportRange report = statisticReportService.rangeDisk(workshopId, startLd, endLd);
//                            return MAPPER.writeValueAsString(report);
//                        }).subscribe(reply::reply, err -> reply.fail(400, err.getLocalizedMessage()))
//                ).rxCompletionHandler()
//        );
    }

}
