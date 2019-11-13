package com.hengyi.japp.mes.auto.query;

import com.hengyi.japp.mes.auto.domain.data.PackageBoxType;
import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import java.io.Serializable;
import java.util.Date;
import java.util.Set;

/**
 * @author jzb 2019-11-13
 */
@Data
public class PackageBoxQuery implements Serializable {
    private boolean inWarehouse;
    @NotBlank
    private String workshopId;
    private String packageBoxCode;
    private String productId;
    private String batchId;
    private String gradeId;
    private PackageBoxType type;
    private Set<String> budatClassIds;
    private Date startBudat;
    private Date endBudat;
    private Date startDate;
    private Date endDate;
    private String smallBatchId;
    private String riambJobId;
    @Min(0)
    private int first;
    @Min(10)
    private int pageSize;
}
