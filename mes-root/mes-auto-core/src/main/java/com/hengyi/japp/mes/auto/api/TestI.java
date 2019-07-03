package com.hengyi.japp.mes.auto.api;

import javax.validation.constraints.NotBlank;

/**
 * @author jzb 2019-04-26
 */
public class TestI implements TestResource {
    @Override
    public void test(@NotBlank String test) {

    }
}
