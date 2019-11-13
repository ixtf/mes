package com.hengyi.japp.mes.auto.query;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import java.io.Serializable;
import java.util.Date;

/**
 * @author jzb 2019-11-13
 */
@Data
public class DyeingPrepareQuery implements Serializable {
    private boolean submitted;
    @NotBlank
    private String workshopId;
    private String silkCarId;
    private String creatorId;
    private String lineMachineId;
    private Date startDate;
    private Date endDate;
    @Min(0)
    private int first;
    @Min(10)
    private int pageSize;
}
