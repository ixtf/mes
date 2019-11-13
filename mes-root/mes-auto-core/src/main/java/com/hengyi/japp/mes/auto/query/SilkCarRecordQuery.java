package com.hengyi.japp.mes.auto.query;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import java.io.Serializable;

/**
 * @author jzb 2019-11-13
 */
@Data
public class SilkCarRecordQuery implements Serializable {
    @NotBlank
    private String workshopId;
    private boolean submitted;
    @Min(0)
    private int first;
    @Min(10)
    private int pageSize;
}
