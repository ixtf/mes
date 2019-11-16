package com.hengyi.japp.mes.auto.dto.search;

import com.hengyi.japp.mes.auto.domain.data.PackageBoxType;
import com.hengyi.japp.mes.auto.domain.data.SaleType;
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
public class PackageBoxDTO extends EntityDTO {
    private PackageBoxType type;
    private String code;
    private String palletCode;
    private SaleType saleType;
    private double netWeight;
    private double grossWeight;
    private BatchInfo batch;
    private EntityDTO grade;
    private Collection<SilkInfo> silks;
    private List<SilkCarRecordInfo> silkCarRecords;
    private Date printDate;
    private EntityDTO printClass;
    private int printCount;
    private Date budat;
    private EntityDTO sapT001l;
    private EntityDTO budatClass;
    private boolean inWarehouse;

    private OperatorDTO creator;
    private Date createDateTime;
    private OperatorDTO modifier;
    private Date modifyDateTime;

    @Data
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class BatchInfo extends EntityDTO {
        private EntityDTO product;
        private EntityDTO workshop;
    }

    @Data
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class SilkCarRecordInfo extends EntityDTO {
        private SilkCarInfo silkCar;
    }

    @Data
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class SilkCarInfo extends EntityDTO {
        private String code;
    }

    @Data
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class SilkInfo extends EntityDTO {
        private String code;
    }
}
