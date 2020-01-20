package com.hengyi.japp.mes.auto.report.strippingReport;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.report.application.QueryService;
import com.hengyi.japp.mes.auto.report.application.RedisService;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonObject;
import lombok.Data;
import reactor.core.publisher.Mono;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Collection;
import java.util.Date;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2020-01-21
 */
@Singleton
public class StrippingReportService {
    private final QueryService searchService;

    @Inject
    private StrippingReportService(QueryService searchService) {
        this.searchService = searchService;
    }

    @Data
    public static class Command implements Serializable {
        @NotBlank
        private String workshopId;
        @NotNull
        private Date startDateTime;
        @NotNull
        private Date endDateTime;

        private static Command from(Message<JsonObject> reply) {
            final JsonObject body = reply.body();
            final JsonObject message = body.getJsonObject("message");
            return MAPPER.convertValue(message, Command.class);
        }
    }

    public void handle(Message<JsonObject> reply) {
        Mono.fromCallable(() -> {
            final Command command = Command.from(reply);
            @NotBlank final String workshopId = command.getWorkshopId();
            final long startDateTime = command.getStartDateTime().getTime();
            final long endDateTime = command.getEndDateTime().getTime();
            final Collection<String> ids = RedisService.listSilkCarRuntimeSilkCarRecordIds();
            ids.addAll(searchService.querySilkCarRecordIdsByEventSourceCanHappen(workshopId, startDateTime, endDateTime));
            final StrippingReport report = new StrippingReport(workshopId, startDateTime, endDateTime, ids);
            return MAPPER.writeValueAsString(report.getGroupByOperators());
        }).subscribe(reply::reply,err->reply.fail(400,err.getLocalizedMessage()));
    }
}
