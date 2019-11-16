package com.hengyi.japp.mes.auto.search.interfaces.rest;

import com.github.ixtf.vertx.ws.rs.JaxRsRouteResolver;

/**
 * @author jzb 2019-11-13
 */
public class RestResolver extends JaxRsRouteResolver {

    @Override
    protected String[] getPackages() {
        return new String[]{this.getClass().getPackageName()};
    }

}
