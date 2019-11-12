package com.hengyi.japp.mes.auto.search.interfaces.rest;

import com.github.ixtf.vertx.ws.rs.JaxRsRouteResolver;

import java.util.Set;

/**
 * @author jzb 2019-11-13
 */
public class RestResolver extends JaxRsRouteResolver {

    @Override
    protected Set<String> getPackages() {
        return Set.of(this.getClass().getPackageName());
    }

    @Override
    protected Set<Class> getClasses() {
        return null;
    }
}
