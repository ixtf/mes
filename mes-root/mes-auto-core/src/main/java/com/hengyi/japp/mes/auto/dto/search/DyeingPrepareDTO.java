package com.hengyi.japp.mes.auto.dto.search;

import com.hengyi.japp.mes.auto.domain.data.DyeingType;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Collection;
import java.util.Date;
import java.util.List;

/**
 * @author jzb 2019-02-25
 */
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class DyeingPrepareDTO extends EntityDTO {
    private DyeingType type;
    private SilkCarRecordInfo silkCarRecord;
    private Collection<SilkInfo> silks;
    private List<SilkCarRecordInfo> silkCarRecords;
    private boolean submitted;
    private OperatorDTO creator;
    private Date createDateTime;
    private OperatorDTO submitter;
    private Date submitDateTime;

    @Data
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class SilkCarRecordInfo extends EntityDTO {
        private SilkCarInfo silkCar;
        private BatchInfo batch;
    }

    @Data
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class SilkCarInfo extends EntityDTO {
        private String code;
    }

    @Data
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class SilkInfo extends EntityDTO {
        private String doffingNum;
        private BatchInfo batch;
        private EntityDTO lineMachine;
    }

    @Data
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class BatchInfo extends EntityDTO {
        private WorkshopInfo workshop;
    }

    @Data
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class WorkshopInfo extends EntityDTO {
    }
}
