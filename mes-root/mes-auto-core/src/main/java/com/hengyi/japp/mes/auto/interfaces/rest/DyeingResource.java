package com.hengyi.japp.mes.auto.interfaces.rest;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.DyeingService;
import com.hengyi.japp.mes.auto.application.command.DyeingResultUpdateCommand;
import com.hengyi.japp.mes.auto.application.query.DyeingPrepareQuery;
import com.hengyi.japp.mes.auto.application.query.DyeingPrepareResultQuery;
import com.hengyi.japp.mes.auto.domain.DyeingResult;
import com.hengyi.japp.mes.auto.repository.DyeingPrepareRepository;

import javax.validation.constraints.Min;
import javax.ws.rs.*;
import java.security.Principal;
import java.util.List;
import java.util.concurrent.CompletionStage;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * @author jzb 2018-11-02
 */
@Singleton
@Path("api")
@Produces(APPLICATION_JSON)
public class DyeingResource {
    private final DyeingService dyeingService;
    private final DyeingPrepareRepository dyeingPrepareRepository;

    @Inject
    private DyeingResource(DyeingService dyeingService, DyeingPrepareRepository dyeingPrepareRepository) {
        this.dyeingService = dyeingService;
        this.dyeingPrepareRepository = dyeingPrepareRepository;
    }

    @Path("dyeingPrepares/{id}/result")
    @PUT
    public void update(Principal principal, @PathParam("id") String id, DyeingResultUpdateCommand command) {
        dyeingService.update(principal, id, command);
    }

    @Path("dyeingPrepares/{id}/dyeingResults/{dyeingResultId}")
    @PUT
    public void update(Principal principal, @PathParam("id") String id, @PathParam("dyeingResultId") String dyeingResultId, DyeingResultUpdateCommand.Item command) {
        dyeingService.update(principal, id, dyeingResultId, command);
    }

    @Path("batchDyeingPrepareResult")
    @POST
    public void update(Principal principal, DyeingResultUpdateCommand.Batch batch) {
        batch.getCommands().parallelStream().forEach(it -> {
            final String id = it.getDyeingPrepare().getId();
            final DyeingResultUpdateCommand command = new DyeingResultUpdateCommand();
            command.setItems(it.getItems());
            update(principal, id, command);
        });
    }

    @Path("dyeingPrepares")
    @GET
    public CompletionStage<DyeingPrepareQuery.Result> dyeingPrepares(@QueryParam("first") @DefaultValue("0") @Min(0) int first,
                                                                     @QueryParam("pageSize") @DefaultValue("50") @Min(1) int pageSize,
                                                                     @QueryParam("startDateTimestamp") long startDateTimestamp,
                                                                     @QueryParam("endDateTimestamp") long endDateTimestamp,
                                                                     @QueryParam("type") String typeString,
                                                                     @QueryParam("hrIdQ") String hrIdQ,
                                                                     @QueryParam("silkCarId") String silkCarId,
                                                                     @QueryParam("lineMachineId") String lineMachineId,
                                                                     @QueryParam("doffingNum") String doffingNum,
                                                                     @QueryParam("workshopId") String workshopId) {
        final DyeingPrepareQuery dyeingPrepareQuery = DyeingPrepareQuery.builder()
                .first(first)
                .pageSize(pageSize)
                .hrIdQ(hrIdQ)
                .silkCarId(silkCarId)
                .workshopId(workshopId)
                .lineMachineId(lineMachineId)
                .doffingNum(doffingNum)
                .startDateTimestamp(startDateTimestamp)
                .endDateTimestamp(endDateTimestamp)
                .build();
        return dyeingPrepareRepository.query(dyeingPrepareQuery);
    }

    @Path("dyeingResults")
    @GET
    public CompletionStage<DyeingPrepareResultQuery.Result> dyeingResults(@QueryParam("first") @DefaultValue("0") @Min(0) int first,
                                                                          @QueryParam("pageSize") @DefaultValue("50") @Min(1) int pageSize,
                                                                          @QueryParam("startDateTimestamp") long startDateTimestamp,
                                                                          @QueryParam("endDateTimestamp") long endDateTimestamp,
                                                                          @QueryParam("lineMachineId") String lineMachineId,
                                                                          @QueryParam("silkCarId") String silkCarId,
                                                                          @QueryParam("hrIdQ") String hrIdQ,
                                                                          @QueryParam("type") String typeString,
                                                                          @QueryParam("workshopId") String workshopId) {
        final DyeingPrepareResultQuery dyeingPrepareResultQuery = DyeingPrepareResultQuery.builder()
                .first(first)
                .pageSize(pageSize)
                .hrIdQ(hrIdQ)
                .silkCarId(silkCarId)
                .workshopId(workshopId)
                .lineMachineId(lineMachineId)
                .startDateTimestamp(startDateTimestamp)
                .endDateTimestamp(endDateTimestamp)
                .typeString(typeString)
                .build();
        return dyeingPrepareRepository.query(dyeingPrepareResultQuery);
    }

    @Path("dyeingResultsTimeline")
    @GET
    public List<DyeingResult> timeline(@QueryParam("type") @DefaultValue("FIRST") String type,
                                       @QueryParam("lineMachineId") String lineMachineId,
                                       @QueryParam("spindle") @DefaultValue("1") @Min(1) int spindle,
                                       @QueryParam("size") @DefaultValue("50") @Min(1) int size,
                                       @QueryParam("currentId") String currentId) {
        return dyeingService.listTimeline(type, currentId, lineMachineId, spindle, size);
    }

}
