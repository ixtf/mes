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
public class SilkBarcodeDTO extends EntityDTO {
    private LineMachine lineMachine;
    private long codeDoffingNum;
    private Date codeDate;
    private String doffingNum;
    private EntityDTO batch;
    private boolean deleted;

    @Data
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class LineMachine extends EntityDTO {
        private Line line;
    }

    @Data
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class Line extends EntityDTO {
        private EntityDTO workshop;
    }

}
