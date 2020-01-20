package com.hengyi.japp.mes.auto.report.verticle;

import com.hengyi.japp.mes.auto.report.strippingReport.StrippingReportService;
import io.vertx.core.AbstractVerticle;
import lombok.extern.slf4j.Slf4j;

import static com.hengyi.japp.mes.auto.GuiceModule.getInstance;

//import com.hengyi.japp.mes.auto.report.application.StrippingReportService;

/**
 * @author jzb 2019-05-20
 */
@Slf4j
public class WorkerVerticle extends AbstractVerticle {

    @Override
    public void start() throws Exception {
        vertx.eventBus().consumer("mes-auto:ReportService:strippingReport", getInstance(StrippingReportService.class)::handle);
    }

//    @Override
//    public Completable rxStart() {
//        return Completable.mergeArray(
//                vertx.eventBus().<JsonObject>consumer("mes-auto:report:strippingReport", reply -> Single.fromCallable(() -> {
//                    final JsonObject msg = reply.body();
//                    final JsonObject postBody = new JsonObject(msg.getString("body"));
//                    final String workshopId = postBody.getString("workshopId");
//                    final long startDateTime = NumberUtils.toLong(postBody.getString("startDateTime"));
//                    final long endDateTime = NumberUtils.toLong(postBody.getString("endDateTime"));
//                    final StrippingReport report = StrippingReport.create(workshopId, startDateTime, endDateTime);
//                    return MAPPER.writeValueAsString(report.getGroupByOperators());
//                }).subscribe(reply::reply, err -> {
//                    log.error("", err);
//                    reply.fail(400, err.getLocalizedMessage());
//                })).rxCompletionHandler(),
//                vertx.eventBus().<JsonObject>consumer("mes-auto:report:dyeingReport", reply -> Single.fromCallable(() -> {
//                    final JsonObject msg = reply.body();
//                    final JsonObject postBody = new JsonObject(msg.getString("body"));
//                    final String workshopId = postBody.getString("workshopId");
//                    final long startDateTime = NumberUtils.toLong(postBody.getString("startDateTime"));
//                    final long endDateTime = NumberUtils.toLong(postBody.getString("endDateTime"));
//                    final DyeingReport report = DyeingReport.create(workshopId, startDateTime, endDateTime);
//                    return MAPPER.writeValueAsString(report.getGroupByOperators());
//                }).subscribe(reply::reply, err -> {
//                    log.error("", err);
//                    reply.fail(400, err.getLocalizedMessage());
//                })).rxCompletionHandler(),
//                vertx.eventBus().<JsonObject>consumer("mes-auto:report:inspectionReport", reply -> Single.fromCallable(() -> {
//                    final JsonObject msg = reply.body();
//                    final JsonObject postBody = new JsonObject(msg.getString("body"));
//                    final String workshopId = postBody.getString("workshopId");
//                    final long startDateTime = NumberUtils.toLong(postBody.getString("startDateTime"));
//                    final long endDateTime = NumberUtils.toLong(postBody.getString("endDateTime"));
//                    final InspectionReport report = InspectionReport.create(workshopId, startDateTime, endDateTime);
//                    return MAPPER.writeValueAsString(report.toJsonNode());
//                }).subscribe(reply::reply, err -> {
//                    log.error("", err);
//                    reply.fail(400, err.getLocalizedMessage());
//                })).rxCompletionHandler(),
//                vertx.eventBus().<JsonObject>consumer("mes-auto:report:toDtyReport", reply -> Single.fromCallable(() -> {
//                    final JsonObject msg = reply.body();
//                    final JsonObject postBody = new JsonObject(msg.getString("body"));
//                    final String workshopId = postBody.getString("workshopId");
//                    final long startDateTime = NumberUtils.toLong(postBody.getString("startDateTime"));
//                    final long endDateTime = NumberUtils.toLong(postBody.getString("endDateTime"));
//                    final ToDtyReport report = ToDtyReport.create(workshopId, startDateTime, endDateTime);
//                    return MAPPER.writeValueAsString(report.getGroupByOperators());
//                }).subscribe(reply::reply, err -> {
//                    log.error("", err);
//                    reply.fail(400, err.getLocalizedMessage());
//                })).rxCompletionHandler(),
//                vertx.eventBus().<JsonObject>consumer("mes-auto:report:toDtyConfirmReport", reply -> Single.fromCallable(() -> {
//                    final JsonObject msg = reply.body();
//                    final JsonObject postBody = new JsonObject(msg.getString("body"));
//                    final String workshopId = postBody.getString("workshopId");
//                    final long startDateTime = NumberUtils.toLong(postBody.getString("startDateTime"));
//                    final long endDateTime = NumberUtils.toLong(postBody.getString("endDateTime"));
//                    final ToDtyConfirmReport report = ToDtyConfirmReport.create(workshopId, startDateTime, endDateTime);
//                    return MAPPER.writeValueAsString(report.getGroupByOperators());
//                }).subscribe(reply::reply, err -> {
//                    log.error("", err);
//                    reply.fail(400, err.getLocalizedMessage());
//                })).rxCompletionHandler(),
//                vertx.eventBus().<JsonObject>consumer("mes-auto:report:packageReport", reply -> Single.fromCallable(() -> {
//                    final JsonObject msg = reply.body();
//                    final JsonObject postBody = new JsonObject(msg.getString("body"));
//                    final String workshopId = postBody.getString("workshopId");
//                    final long startDateTime = NumberUtils.toLong(postBody.getString("startDateTime"));
//                    final long endDateTime = NumberUtils.toLong(postBody.getString("endDateTime"));
//                    final PackageBoxReport_ByOperator report = PackageBoxReport_ByOperator.create(workshopId, startDateTime, endDateTime);
//                    return MAPPER.writeValueAsString(report.toJsonNode());
//                }).subscribe(reply::reply, err -> {
//                    log.error("", err);
//                    reply.fail(400, err.getLocalizedMessage());
//                })).rxCompletionHandler(),
////                vertx.eventBus().consumer("mes-auto:report:measureFiberReport", measureFiberReportService::measureFiberReport).rxCompletionHandler(),
////                vertx.eventBus().consumer("mes-auto:report:silkExceptionReport", silkExceptionReportService::silkExceptionReport).rxCompletionHandler(),
//
//                vertx.eventBus().<JsonObject>consumer("mes-auto:report:doffingSilkCarRecordReport", reply -> Single.fromCallable(() -> {
//                    final JsonObject msg = reply.body();
//                    final JsonObject queryParams = msg.getJsonObject("queryParams");
//                    final String workshopId = queryParams.getJsonArray("workshopId").getString(0);
//                    final long startDateTime = Optional.ofNullable(queryParams)
//                            .map(it -> it.getJsonArray("startDateTime"))
//                            .map(it -> it.getString(0))
//                            .map(NumberUtils::toLong).get();
//                    final long endDateTime = Optional.ofNullable(queryParams)
//                            .map(it -> it.getJsonArray("endDateTime"))
//                            .map(it -> it.getString(0))
//                            .map(NumberUtils::toLong).get();
//                    final Collection<String> silkCarRecordIds = queryService.querySilkCarRecordIds(workshopId, startDateTime, endDateTime);
//                    final DoffingSilkCarRecordReport report = new DoffingSilkCarRecordReport(silkCarRecordIds);
//                    return MAPPER.writeValueAsString(report.toJsonNode());
//                }).subscribe(reply::reply, err -> {
//                    log.error("", err);
//                    reply.fail(400, err.getLocalizedMessage());
//                })).rxCompletionHandler(),
//
//                vertx.eventBus().<JsonObject>consumer("mes-auto:report:silkCarRuntimeSilkCarCodes", reply -> Single.fromCallable(() -> {
//                    final JsonObject msg = reply.body();
//                    final JsonObject queryParams = msg.getJsonObject("queryParams");
//                    final String workshopId = queryParams.getJsonArray("workshopId").getString(0);
//                    final Set<String> silkCarCodes = RedisService.listSilkCarRuntimeSilkCarCodes().collect(toSet());
//                    if (J.isBlank(workshopId)) {
//                        return MAPPER.writeValueAsString(silkCarCodes);
//                    }
//                    return MAPPER.writeValueAsString(silkCarCodes);
//                }).subscribe(reply::reply, err -> {
//                    log.error("", err);
//                    reply.fail(400, err.getLocalizedMessage());
//                })).rxCompletionHandler(),
//
//                vertx.eventBus().<JsonObject>consumer("mes-auto:report:statisticReport:generate", reply -> Single.fromCallable(() -> {
//                    final JsonObject msg = reply.body();
//                    final JsonObject postBody = new JsonObject(msg.getString("body"));
//                    final String workshopId = postBody.getString("workshopId");
//                    final LocalDate ld = LocalDate.parse(postBody.getString("date"));
//                    final StatisticReportService statisticReportService = INJECTOR.getInstance(StatisticReportService.class);
//                    final StatisticReportDay report = statisticReportService.generate(workshopId, ld).block();
//                    return MAPPER.writeValueAsString(report);
//                }).subscribe(reply::reply, err -> {
//                    log.error("", err);
//                    reply.fail(400, err.getLocalizedMessage());
//                })).rxCompletionHandler(),
//
//                vertx.eventBus().<JsonObject>consumer("mes-auto:report:statisticReport:rangeDisk", reply -> Single.fromCallable(() -> {
//                    final JsonObject msg = reply.body();
//                    final JsonObject postBody = new JsonObject(msg.getString("body"));
//                    final String workshopId = postBody.getString("workshopId");
//                    final LocalDate startLd = LocalDate.parse(postBody.getString("startDate"));
//                    final LocalDate endLd = LocalDate.parse(postBody.getString("endDate"));
//                    final StatisticReportService statisticReportService = INJECTOR.getInstance(StatisticReportService.class);
//                    final StatisticReportRange report = statisticReportService.rangeDisk(workshopId, startLd, endLd);
//                    return MAPPER.writeValueAsString(report);
//                }).subscribe(reply::reply, err -> {
//                    log.error("", err);
//                    reply.fail(400, err.getLocalizedMessage());
//                })).rxCompletionHandler(),
//
//                vertx.eventBus().<JsonObject>consumer("mes-auto:report:statisticReport:download", reply -> Single.fromCallable(() -> {
//                    final JsonObject msg = reply.body();
//                    final JsonObject queryParams = msg.getJsonObject("queryParams");
//                    final String workshopId = queryParams.getJsonArray("workshopId").getString(0);
//                    final LocalDate startLd = Optional.ofNullable(queryParams)
//                            .map(it -> it.getJsonArray("startDate"))
//                            .map(it -> it.getString(0))
//                            .map(LocalDate::parse).get();
//                    final LocalDate endLd = Optional.ofNullable(queryParams)
//                            .map(it -> it.getJsonArray("endDate"))
//                            .map(it -> it.getString(0))
//                            .map(LocalDate::parse).get();
//                    final StatisticReportService statisticReportService = INJECTOR.getInstance(StatisticReportService.class);
//                    final StatisticReportRange report = statisticReportService.rangeDisk(workshopId, startLd, endLd);
//                    final String fileName = String.join(".",
//                            report.getWorkshop().getCode(),
//                            startLd.equals(endLd) ? "" + startLd : String.join("~", "" + startLd, "" + endLd),
//                            "xlsx"
//                    );
//                    return Pair.of(URLEncoder.encode(fileName, UTF_8), report.toByteArray());
//                }).subscribe(pair -> {
//                    final DeliveryOptions deliveryOptions = new DeliveryOptions().addHeader("Content-Disposition", "attachment;filename=" + pair.getKey());
//                    reply.reply(pair.getValue(), deliveryOptions);
//                }, err -> {
//                    log.error("", err);
//                    reply.fail(400, err.getLocalizedMessage());
//                })).rxCompletionHandler(),
//
//                vertx.eventBus().<JsonArray>consumer("mes-auto:report:statisticReport:combines", reply -> Single.fromCallable(() -> {
//                    final StatisticReportCombine report = StatisticReportCombine.from(reply.body());
//                    return report.toByteArray();
//                }).subscribe(bytes -> {
//                    final DeliveryOptions deliveryOptions = new DeliveryOptions().addHeader("Content-Disposition", "attachment;filename=combines.xlsx");
//                    reply.reply(bytes, deliveryOptions);
//                }, err -> {
//                    log.error("", err);
//                    reply.fail(400, err.getLocalizedMessage());
//                })).rxCompletionHandler()
//        );
//    }

}
