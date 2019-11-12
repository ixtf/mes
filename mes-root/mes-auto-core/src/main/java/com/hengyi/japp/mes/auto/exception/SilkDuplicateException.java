package com.hengyi.japp.mes.auto.exception;

import com.github.ixtf.japp.core.exception.JError;
import com.hengyi.japp.mes.auto.Constant;
import com.hengyi.japp.mes.auto.domain.Silk;
import lombok.Setter;

/**
 * @author jzb 2018-11-23
 */
public class SilkDuplicateException extends JError {
    @Setter
    private Silk silk;

    public SilkDuplicateException() {
        super(Constant.ErrorCode.SILK_DUPLICATE);
    }

    @Override
    public String getMessage() {
        return "Silk[" + silk.getCode() + "],丝锭重复落筒";
    }
}
