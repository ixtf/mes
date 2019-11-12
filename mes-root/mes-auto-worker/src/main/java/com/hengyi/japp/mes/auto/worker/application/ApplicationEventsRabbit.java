package com.hengyi.japp.mes.auto.worker.application;

import com.github.ixtf.persistence.IEntity;
import com.google.common.collect.ImmutableMap;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.Constant.AMQP;
import com.hengyi.japp.mes.auto.application.ApplicationEvents;
import com.hengyi.japp.mes.auto.domain.Line;
import com.hengyi.japp.mes.auto.domain.LineMachine;
import com.hengyi.japp.mes.auto.domain.LineMachineProductPlan;
import com.hengyi.japp.mes.auto.interfaces.jikon.dto.GetSilkSpindleInfoDTO;
import com.hengyi.japp.mes.auto.interfaces.riamb.dto.RiambFetchSilkCarRecordResultDTO;
import io.vertx.core.json.JsonObject;
import io.vertx.reactivex.core.Vertx;
import io.vertx.reactivex.rabbitmq.RabbitMQClient;
import lombok.SneakyThrows;

import java.security.Principal;
import java.util.Date;
import java.util.List;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2018-06-25
 */
@Singleton
public class ApplicationEventsRabbit implements ApplicationEvents {
    private final Vertx vertx;
    private final RabbitMQClient rabbitMQClient;

    @Inject
    private ApplicationEventsRabbit(Vertx vertx, RabbitMQClient rabbitMQClient) {
        this.vertx = vertx;
        this.rabbitMQClient = rabbitMQClient;
    }

    @SneakyThrows
    @Override
    public void fire(Object source, CURDType curdType, Principal principal, Object command, IEntity target) {
        final CURDMessage body = new CURDMessage();
        body.setSource(source.getClass().getName());
        body.setCurdType(curdType);
        body.setPrincipal(principal.getName());
        body.setCommand(MAPPER.writeValueAsString(command));
        body.setTargetClass(target.getClass().getName());
        body.setTargetId(target.getId());
        body.setDateTime(new Date());
        final JsonObject message = new JsonObject().put("body", MAPPER.writeValueAsString(body));
        rabbitMQClient.rxBasicPublish(AMQP.MES_AUTO_CURD_EXCHANGE, "", message).subscribe();
    }

    @SneakyThrows
    @Override
    public void fire(LineMachineProductPlan lineMachineProductPlan) {
        final LineMachine lineMachine = lineMachineProductPlan.getLineMachine();
        final Line line = lineMachine.getLine();
        final ImmutableMap<String, Object> map = ImmutableMap.of("lineMachine", lineMachine, "batch", lineMachineProductPlan.getBatch());
        final String message = MAPPER.writeValueAsString(map);
        vertx.eventBus().publish("mes-auto://websocket/boards/workshopExceptionReport/lines/" + line.getId(), message);
    }

    @SneakyThrows
    @Override
    public void fire(SilkCarRuntime silkCarRuntime, GetSilkSpindleInfoDTO dto, List<String> reasons) {
        final ImmutableMap<String, Object> map = ImmutableMap.of("silkCarRuntime", silkCarRuntime, "reasons", reasons);
        final String message = MAPPER.writeValueAsString(map);
        vertx.eventBus().publish("mes-auto://websocket/boards/JikonAdapterSilkCarInfoFetchReasons", message);
    }

    @SneakyThrows
    @Override
    public void fire(SilkCarRuntime silkCarRuntime, RiambFetchSilkCarRecordResultDTO dto, List<String> reasons) {
        final ImmutableMap<String, Object> map = ImmutableMap.of("silkCarRuntime", silkCarRuntime, "reasons", reasons);
        final String message = MAPPER.writeValueAsString(map);
        vertx.eventBus().publish("mes-auto://websocket/boards/JikonAdapterSilkCarInfoFetchReasons", message);
    }
}
