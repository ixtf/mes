package com.hengyi.japp.mes.auto.dto.search;

import com.hengyi.japp.mes.auto.dto.EntityDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * @author jzb 2019-02-25
 */
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class SilkCarRecordDTO extends EntityDTO {
    private SilkCar silkCar;
    private Batch batch;
    private Date startDateTime;
    private Date endDateTime;

    @Data
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class SilkCar extends EntityDTO {
        private String code;
    }

    @Data
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class Batch extends EntityDTO {
        private EntityDTO product;
        private EntityDTO workshop;
    }

}
