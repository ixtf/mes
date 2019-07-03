package com.hengyi.japp.mes.auto.interfaces.warehouse.command;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.io.Serializable;

/**
 * @author jzb 2018-11-07
 */
@Data
public class WarehousePackageBoxFetchCommand implements Serializable {
    @NotBlank
    private String code;
}
