package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.DyeingResultUpdateCommand;
import com.hengyi.japp.mes.auto.domain.*;

import java.security.Principal;
import java.util.Collection;
import java.util.List;

/**
 * 织袜、染判
 *
 * @author jzb 2018-08-08
 */
public interface DyeingService {

    static String firstDyeingKey(LineMachine lineMachine, int spindle) {
        final Line line = lineMachine.getLine();
        return "Dyeing-First[" + line.getName() + "-" + lineMachine.getItem() + "-" + spindle + "-" + lineMachine.getId() + "]";
    }

    static String crossDyeingKey(LineMachine lineMachine, int spindle) {
        final Line line = lineMachine.getLine();
        return "Dyeing-Cross[" + line.getName() + "-" + lineMachine.getItem() + "-" + spindle + "-" + lineMachine.getId() + "]";
    }

    void update(Principal principal, String id, DyeingResultUpdateCommand command);

    void update(Principal principal, String id, String dyeingResultId, DyeingResultUpdateCommand.Item command);

    DyeingPrepare create(Principal principal, DyeingPrepare dyeingPrepare, SilkCarRuntime silkCarRuntime, Collection<SilkRuntime> silkRuntimes);

    DyeingPrepare create(DyeingPrepare dyeingPrepare, SilkCarRuntime silkCarRuntime1, Collection<SilkRuntime> silkRuntimes1, SilkCarRuntime silkCarRuntime2, Collection<SilkRuntime> silkRuntimes2);

    List<DyeingResult> listTimeline(String type, String currentId, String lineMachineId, int spindle, int size);

}
