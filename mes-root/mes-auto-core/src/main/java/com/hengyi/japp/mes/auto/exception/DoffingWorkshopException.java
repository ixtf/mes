package com.hengyi.japp.mes.auto.exception;

import com.github.ixtf.japp.core.exception.JError;
import com.hengyi.japp.mes.auto.Constant;

/**
 * @author jzb 2018-07-28
 */
public class DoffingWorkshopException extends JError {
    public DoffingWorkshopException() {
        super(Constant.ErrorCode.DOFFING_WORKSHOP);
    }

    @Override
    public String getMessage() {
        return "落筒车间有误";
    }
}
