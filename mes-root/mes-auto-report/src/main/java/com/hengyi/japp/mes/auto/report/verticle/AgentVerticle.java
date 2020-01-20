package com.hengyi.japp.mes.auto.report.verticle;

import com.github.ixtf.vertx.Jvertx;
import com.hengyi.japp.mes.auto.config.MesAutoConfig;
import io.vertx.core.AbstractVerticle;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.ResponseContentTypeHandler;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;

/**
 * @author jzb 2018-06-20
 */
@Slf4j
public class AgentVerticle extends AbstractVerticle {

    @Override
    public void start() {
        final Router router = Jvertx.router(vertx, MesAutoConfig.corsConfig());
        router.route().failureHandler(Jvertx::failureHandler);
        router.route().handler(BodyHandler.create().setUploadsDirectory(FileUtils.getTempDirectoryPath()));
        router.route().handler(ResponseContentTypeHandler.create());
    }

}
