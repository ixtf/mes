package com.hengyi.japp.mes.auto.report.application.command;

import com.fasterxml.jackson.databind.JsonNode;
import com.github.ixtf.japp.core.J;
import lombok.Data;
import lombok.SneakyThrows;
import org.bson.conversions.Bson;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import static com.github.ixtf.japp.core.Constant.MAPPER;
import static com.mongodb.client.model.Filters.*;

/**
 * @author liuyuan
 * @create 2019-05-30 10:43
 * @description
 **/
@Data
public class StrippingReportCommand implements Serializable {
    private String startDate;
    private String endDate;
    private String workshopId;
    @SneakyThrows
    public static StrippingReportCommand strippingReportCommand(Object body) {
        JsonNode jsonNode = MAPPER.readTree((String) body);
        StrippingReportCommand command = MAPPER.convertValue(jsonNode, StrippingReportCommand.class);
        return command;
    }
}
