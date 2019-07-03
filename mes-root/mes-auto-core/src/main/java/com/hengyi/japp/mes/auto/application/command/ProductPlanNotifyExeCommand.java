package com.hengyi.japp.mes.auto.application.command;

import com.hengyi.japp.mes.auto.dto.EntityDTO;
import lombok.Data;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.Collection;

/**
 * @author jzb 2018-06-21
 */
@Data
public class ProductPlanNotifyExeCommand implements Serializable {
    @NotNull
    private EntityDTO lineMachine;

    @Data
    public static class Batch {
        @Size(min = 1)
        @NotNull
        private Collection<EntityDTO> lineMachines;
    }
}
