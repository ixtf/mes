package com.hengyi.japp.mes.auto.query;

import com.github.ixtf.japp.core.J;
import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Date;

import static java.util.Optional.ofNullable;

/**
 * @author jzb 2019-11-13
 */
@Data
public class SilkCarRecordQuery implements Serializable {
    @Min(0)
    private int first;
    @Min(10)
    private int pageSize;
    private String workshopId;
    private String silkCarId;
    private String silkCarCode;
    @NotNull
    private LocalDate startDate;
    @NotNull
    private LocalDate endDate;

    public void setStartDate(Date date) {
        startDate = ofNullable(date).map(J::localDate).orElse(null);
    }

    public void setEndDate(Date date) {
        endDate = ofNullable(date).map(J::localDate).orElse(null);
    }

}
