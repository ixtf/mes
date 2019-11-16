package com.hengyi.japp.mes.auto.query;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.github.ixtf.japp.core.J;
import lombok.Data;

import javax.validation.constraints.Min;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Date;

/**
 * @author jzb 2019-11-13
 */
@Data
public class SilkBarcodeQuery implements Serializable {
    private String lineId;
    private String lineMachineId;
    private String batchId;
    private LocalDate startCodeDate;
    private LocalDate endCodeDate;
    private String doffingNum;
    private String doffingNumQ;
    @Min(0)
    private int first;
    @Min(10)
    private int pageSize;

    @JsonSetter("startCodeDateL")
    public void startCodeDateL(long l) {
        startCodeDate = J.localDate(new Date(l));
    }

    @JsonSetter("endCodeDateL")
    public void endCodeDateL(long l) {
        endCodeDate = J.localDate(new Date(l));
    }

}
