package com.hengyi.japp.mes.auto.worker.spi;

import com.github.ixtf.vertx.jax_rs.spi.ResourceProviderJaxRs;
import com.google.common.collect.Sets;

import java.util.Set;

import static com.hengyi.japp.mes.auto.worker.Worker.INJECTOR;

/**
 * @author jzb 2018-11-01
 */
public class WorkerResourceProvider extends ResourceProviderJaxRs {

    @Override
    public String addressPrefix() {
        return "mes-auto";
    }

    @Override
    protected Set<String> getPackages() {
        return Sets.newHashSet("com.hengyi.japp.mes.auto");
    }

    @Override
    protected Set<Class> getClasses() {
        return null;
    }

    @Override
    public <T> T getProxy(Class<T> clazz) {
        return INJECTOR.getInstance(clazz);
    }
}
