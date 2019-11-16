package com.hengyi.japp.mes.auto.dto.search;

import com.hengyi.japp.mes.auto.dto.EntityDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * @author jzb 2019-02-25
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class OperatorDTO extends EntityDTO {
    private String hrId;
}
