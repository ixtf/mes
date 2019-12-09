package com.hengyi.japp.mes.auto.query;

import lombok.Data;

import javax.validation.constraints.Min;
import java.io.Serializable;
import java.util.Date;

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
    private Date startDateTime;
    private Date endDateTime;
}
