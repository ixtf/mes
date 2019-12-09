package com.hengyi.japp.mes.auto.query;

import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * @author jzb 2019-11-13
 */
@Data
public class SilkCarRecordQueryByEventSourceCanHappen implements Serializable {
    private String workshopId;
    private Date startDateTime;
    private Date endDateTime;
}
