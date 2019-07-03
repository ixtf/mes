package com.hengyi.japp.mes.auto.worker.application;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.AuthService;
import com.hengyi.japp.mes.auto.application.DyeingService;
import com.hengyi.japp.mes.auto.application.SilkCarRecordService;
import com.hengyi.japp.mes.auto.application.SilkCarRuntimeService;
import com.hengyi.japp.mes.auto.repository.*;
import lombok.extern.slf4j.Slf4j;


/**
 * @author jzb 2018-06-22
 */
@Slf4j
@Singleton
public class SilkCarRuntimeServiceImpl implements SilkCarRuntimeService {
    private final AuthService authService;
    private final SilkCarRecordService silkCarRecordService;
    private final DyeingService dyeingService;
    private final WorkshopRepository workshopRepository;
    private final SilkCarRecordRepository silkCarRecordRepository;
    private final SilkCarRepository silkCarRepository;
    private final GradeRepository gradeRepository;
    private final SilkRepository silkRepository;
    private final DyeingSampleRepository dyeingSampleRepository;
    private final TemporaryBoxRecordRepository temporaryBoxRecordRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private SilkCarRuntimeServiceImpl(AuthService authService, SilkCarRecordService silkCarRecordService, DyeingService dyeingService, WorkshopRepository workshopRepository, SilkCarRecordRepository silkCarRecordRepository, SilkCarRepository silkCarRepository, GradeRepository gradeRepository, SilkRepository silkRepository, DyeingSampleRepository dyeingSampleRepository, TemporaryBoxRecordRepository temporaryBoxRecordRepository, OperatorRepository operatorRepository) {
        this.authService = authService;
        this.silkCarRecordService = silkCarRecordService;
        this.dyeingService = dyeingService;
        this.workshopRepository = workshopRepository;
        this.silkCarRecordRepository = silkCarRecordRepository;
        this.silkCarRepository = silkCarRepository;
        this.gradeRepository = gradeRepository;
        this.silkRepository = silkRepository;
        this.dyeingSampleRepository = dyeingSampleRepository;
        this.temporaryBoxRecordRepository = temporaryBoxRecordRepository;
        this.operatorRepository = operatorRepository;
    }


//    @Override
//    public Completable undoEventSource(Principal principal, String code, String eventSourceId) {
//        return silkCarRuntimeRepository.findByCode(code).flatMapSingle(silkCarRuntime -> {
//            final EventSource eventSource = silkCarRuntime.getEventSources().stream()
//                    .filter(it -> Objects.equals(it.getEventId(), eventSourceId))
//                    .findFirst().get();
//            return eventSource.undo(principal);
//        }).flatMapCompletable(it -> silkCarRuntimeRepository.addEventSource(code, it));
//    }
//
//    @Override
//    public Single<JsonNode> physicalInfo(String code) {
//        return silkCarRuntimeRepository.findByCode(code).toSingle().map(silkCarRuntime -> {
//            final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
//            final SilkCar silkCar = silkCarRecord.getSilkCar();
//            final Batch batch = silkCarRecord.getBatch();
//
//            final ArrayNode silksNode = MAPPER.createArrayNode();
//            silkCarRuntime.getSilkRuntimes().stream()
//                    .map(silkRuntime -> {
//                        final Silk silk = silkRuntime.getSilk();
//                        final LineMachine lineMachine = silk.getLineMachine();
//                        final Line line = lineMachine.getLine();
//
//                        final String abnormalCauses = CollectionUtils.emptyIfNull(silkRuntime.getExceptions())
//                                .stream()
//                                .map(SilkException::getName)
//                                .collect(Collectors.joining(","));
//                        return MAPPER.createObjectNode()
//                                .put("productLine", line.getName())
//                                .put("item", lineMachine.getItem())
//                                .put("fallTime", silk.getDoffingNum())
//                                .put("spindleNumber", silk.getCode())
//                                .put("abnormalCauses", abnormalCauses);
//                    })
//                    .forEach(silksNode::add);
//
//            final Operator operator = Optional.ofNullable(silkCarRecord.getDoffingOperator())
//                    .orElse(silkCarRecord.getCarpoolOperator());
//
//            return MAPPER.createObjectNode()
//                    .put("barCode", silkCar.getCode())
//                    .put("batchNumber", batch.getBatchNo())
//                    .put("spec", batch.getSpec())
//                    .put("product", batch.getProduct().getName())
//                    .put("sampler", operator.getName() + "[" + operator.getHrId() + "]")
//                    .set("silks", silksNode);
//        });
//    }
//
//    @Override
//    public Single<SilkCarRuntime> handle(Principal principal, SilkCarRuntimeAppendEvent.Command command) {
//        return command.toEvent(principal).flatMap(event -> find(command.getSilkCarRecord()).flatMap(silkCarRuntime -> {
//            final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
//            final String code = silkCarRecord.getSilkCar().getCode();
//            if (DoffingType.PHYSICAL_INFO == silkCarRecord.getDoffingType()) {
//                final Completable addEventSource$ = silkCarRuntimeRepository.addEventSource(code, event);
//                final Single<SilkCarRuntime> result$ = SilkCarModel.append(Single.just(silkCarRuntime), command.getLineMachineCount())
//                        .flatMap(it -> it.generateSilkRuntimes(command.getCheckSilks()))
//                        .flatMap(silkRuntimes -> {
//                            silkCarRecord.setDoffingType(DoffingType.MANUAL);
//                            silkRuntimes.forEach(silkRuntime -> {
//                                final Silk silk = silkRuntime.getSilk();
//                                silk.setDoffingType(DoffingType.MANUAL);
//                                if (silk.getDoffingDateTime() == null) {
//                                    silk.setDoffingDateTime(event.getFireDateTime());
//                                    silk.setDoffingOperator(event.getOperator());
//                                    silk.setGrade(silkCarRecord.getGrade());
//                                }
//                            });
//                            event.setSilkRuntimes(silkRuntimes);
//                            final Single<SilkCarRuntime> silkCarRuntime$ = silkCarRuntimeRepository.create(silkCarRecord, silkRuntimes);
//                            return checkSilkDuplicate(silkRuntimes).andThen(silkCarRuntime$);
//                        });
//                final Completable checkRole$ = authService.checkRole(event.getOperator(), RoleType.DOFFING);
//                return checkRole$.andThen(result$).doAfterSuccess(it -> addEventSource$.subscribe());
//            }
//            throw new RuntimeException();
//        }));
//    }
//
//    @Override
//    public Completable delete(Principal principal, SilkCarRuntimeDeleteCommand command) {
//        final Completable result$ = find(command.getSilkCarRecord()).flatMapCompletable(silkCarRuntime -> {
//            final List<EventSource> eventSourceList = J.emptyIfNull(silkCarRuntime.getEventSources()).stream()
//                    .filter(it -> !it.isDeleted())
//                    .filter(it -> !it.getOperator().getId().equals(principal.getName()))
//                    .collect(Collectors.toList());
//            if (J.nonEmpty(eventSourceList)) {
//                throw new RuntimeException("已经有其他人对丝车操作，无法删除");
//            }
//            final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
//            if (silkCarRecord.getCarpoolDateTime() != null) {
//                throw new RuntimeException("拼车，无法删除");
//            }
//            return silkCarRuntimeRepository.delete(silkCarRuntime);
//        });
//        final Completable checks$ = authService.checkRole(principal, RoleType.DOFFING);
//        return checks$.andThen(result$);
//    }
//
//    @Override
//    public Completable flip(Principal principal, SilkCarRuntimeFlipCommand command) {
//        return find(command.getSilkCarRecord()).flatMap(silkCarRuntime -> {
//            final List<EventSource> eventSourceList = J.emptyIfNull(silkCarRuntime.getEventSources()).stream()
//                    .filter(it -> !it.isDeleted())
//                    .collect(Collectors.toList());
//            if (J.nonEmpty(eventSourceList)) {
//                throw new RuntimeException("已经有其他人对丝车操作，无法删除");
//            }
//            final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
//            final String initEventJsonString = silkCarRecord.getInitEventJsonString();
//            return SilkCarRuntimeInitEvent.DTO.from(initEventJsonString).toEvent().flatMap(event -> {
//                final Collection<SilkRuntime> silkRuntimes = event.getSilkRuntimes();
//                silkRuntimes.forEach(it -> {
//                    if (it.getSideType() == SilkCarSideType.A) {
//                        it.setSideType(SilkCarSideType.B);
//                    } else {
//                        it.setSideType(SilkCarSideType.A);
//                    }
//                });
//                event.setSilkRuntimes(silkRuntimes);
//                silkCarRecord.initEvent(event);
//                return silkCarRecordRepository.save(silkCarRecord);
//            });
//        }).ignoreElement();
//    }
//
//    @Override
//    public Single<List<CheckSilkDTO>> handle(Principal principal, SilkCarRuntimeInitEvent.AutoDoffingAdaptCheckSilksCommand command) {
//        final Single<SilkCar> silkCar$ = silkCarRepository.findByCode(command.getSilkCar().getCode());
//        final Single<Workshop> workshop$ = workshopRepository.find(command.getWorkshop().getId());
//        final Single<List<CheckSilkDTO>> result$ = SilkCarModel.auto(silkCar$, workshop$).flatMap(SilkCarModel::checkSilks);
//        final Completable checks$ = authService.checkRole(principal, RoleType.DOFFING);
//        return checks$.andThen(result$);
//    }
//
//    @Override
//    public Single<SilkCarRuntime> handle(Principal principal, SilkCarRuntimeInitEvent.AutoDoffingAdaptCommand command) {
//        final SilkCarRuntimeInitEvent event = new SilkCarRuntimeInitEvent();
//        event.setCommand(MAPPER.convertValue(command, JsonNode.class));
//        return silkCarRepository.findByCode(command.getSilkCar().getCode()).flatMap(it -> {
//            event.setSilkCar(it);
//            final Single<Workshop> workshop$ = workshopRepository.find(command.getWorkshop().getId());
//            return SilkCarModel.auto(Single.just(it), workshop$).flatMap(silkCarModel -> silkCarModel.generateSilkRuntimes(command.getCheckSilks()));
//        }).flatMap(it -> {
//            event.setSilkRuntimes(it);
//            return gradeRepository.find(command.getGrade().getId());
//        }).flatMap(grade -> {
//            event.setGrade(grade);
//            return operatorRepository.find(principal);
//        }).flatMap(it -> {
//            event.fire(it);
//            return doffing(event, DoffingType.AUTO);
//        });
//    }
//
//    @Override
//    public SilkCarRuntime doffing(SilkCarRuntimeInitEvent event, DoffingType doffingType) {
//        final SilkCar silkCar = event.getSilkCar();
//        final Collection<SilkRuntime> silkRuntimes = event.getSilkRuntimes();
//        final Grade grade = event.getGrade();
//        final Single<SilkCarRuntime> result$ = silkCarRecordRepository.create().flatMap(silkCarRecord -> {
//            silkCarRecord.initEvent(event);
//            silkCarRecord.setSilkCar(silkCar);
//            silkCarRecord.setGrade(grade);
//            silkCarRecord.setBatch(checkAndGetBatch(silkRuntimes));
//            silkCarRecord.setDoffingType(doffingType);
//            silkCarRecord.setDoffingOperator(event.getOperator());
//            silkCarRecord.setDoffingDateTime(event.getFireDateTime());
//            silkRuntimes.stream().map(SilkRuntime::getSilk).forEach(silk -> {
//                silk.setDoffingType(silkCarRecord.getDoffingType());
//                silk.setDoffingOperator(event.getOperator());
//                silk.setDoffingDateTime(event.getFireDateTime());
//            });
//            return silkCarRuntimeRepository.create(silkCarRecord, silkRuntimes);
//        });
//        final Completable checkRole = authService.checkRole(event.getOperator(), RoleType.DOFFING);
//        final Completable checks$ = Completable.mergeArray(
//                checkRole,
//                checkSilkDuplicate(silkRuntimes),
//                handlePrevSilkCarData(silkCar)
//        );
//        return checks$.andThen(result$);
//    }
//
//    @Override
//    public Single<List<CheckSilkDTO>> handle(Principal principal, SilkCarRuntimeInitEvent.ManualDoffingAdaptCheckSilksCommand command) {
//        final Single<SilkCar> silkCar$ = silkCarRepository.findByCode(command.getSilkCar().getCode());
//        final Single<List<CheckSilkDTO>> result$ = SilkCarModel.manual(silkCar$, command.getLineMachineCount()).flatMap(SilkCarModel::checkSilks);
//        final Completable checks$ = authService.checkRole(principal, RoleType.DOFFING);
//        return checks$.andThen(result$);
//    }
//
//    @Override
//    public Single<SilkCarRuntime> handle(Principal principal, SilkCarRuntimeInitEvent.ManualDoffingCommand command) {
//        final SilkCarRuntimeInitEvent event = new SilkCarRuntimeInitEvent();
//        event.setCommand(MAPPER.convertValue(command, JsonNode.class));
//        return silkCarRepository.findByCode(command.getSilkCar().getCode()).flatMap(it -> {
//            event.setSilkCar(it);
//            return SilkCarModel.manual(Single.just(it), command.getLineMachineCount())
//                    .flatMap(silkCarModel -> silkCarModel.generateSilkRuntimes(command.getCheckSilks()));
//        }).flatMap(it -> {
//            event.setSilkRuntimes(it);
//            return gradeRepository.find(command.getGrade().getId());
//        }).flatMap(grade -> {
//            event.setGrade(grade);
//            return operatorRepository.find(principal);
//        }).flatMap(it -> {
//            event.fire(it);
//            return doffing(event, DoffingType.MANUAL);
//        });
//    }
//
//    @Override
//    public Single<List<CheckSilkDTO>> handle(Principal principal, SilkCarRuntimeInitEvent.DyeingSampleDoffingCheckSilksCommand command) {
//        final Single<SilkCar> silkCar$ = silkCarRepository.findByCode(command.getSilkCar().getCode());
//        final Single<Workshop> workshop$ = workshopRepository.find(command.getWorkshop().getId());
//        final Single<List<CheckSilkDTO>> result$ = SilkCarModel.dyeingSample(silkCar$, workshop$).flatMap(SilkCarModel::checkSilks);
//        final Completable checks$ = authService.checkRole(principal, RoleType.DOFFING);
//        return checks$.andThen(result$);
//    }
//
//    @Override
//    public Single<SilkCarRuntime> handle(Principal principal, SilkCarRuntimeInitEvent.DyeingSampleDoffingCommand command) {
//        final SilkCarRuntimeInitEvent event = new SilkCarRuntimeInitEvent();
//        event.setCommand(MAPPER.convertValue(command, JsonNode.class));
//        return silkCarRepository.findByCode(command.getSilkCar().getCode()).flatMap(it -> {
//            event.setSilkCar(it);
//            final Single<Workshop> workshop$ = workshopRepository.find(command.getWorkshop().getId());
//            return SilkCarModel.dyeingSample(Single.just(it), workshop$)
//                    .flatMap(silkCarModel -> silkCarModel.generateSilkRuntimes(command.getCheckSilks()));
//        }).flatMap(it -> {
//            event.setSilkRuntimes(it);
//            return gradeRepository.find(command.getGrade().getId());
//        }).flatMap(grade -> {
//            event.setGrade(grade);
//            return operatorRepository.find(principal);
//        }).flatMap(it -> {
//            event.fire(it);
//            return doffing(event, DoffingType.DYEING_SAMPLE);
//        });
//    }
//
//    @Override
//    public Single<List<CheckSilkDTO>> handle(Principal principal, SilkCarRuntimeInitEvent.PhysicalInfoDoffingCheckSilksCommand command) {
//        final Single<SilkCar> silkCar$ = silkCarRepository.findByCode(command.getSilkCar().getCode());
//        final Single<Workshop> workshop$ = workshopRepository.find(command.getWorkshop().getId());
//        final Single<List<CheckSilkDTO>> result$ = SilkCarModel.physicalInfo(silkCar$, workshop$).flatMap(SilkCarModel::checkSilks);
//        final Completable checks$ = authService.checkRole(principal, RoleType.DOFFING);
//        return checks$.andThen(result$);
//    }
//
//    @Override
//    public Single<SilkCarRuntime> handle(Principal principal, SilkCarRuntimeInitEvent.PhysicalInfoDoffingCommand command) {
//        final SilkCarRuntimeInitEvent event = new SilkCarRuntimeInitEvent();
//        event.setCommand(MAPPER.convertValue(command, JsonNode.class));
//        return silkCarRepository.findByCode(command.getSilkCar().getCode()).flatMap(it -> {
//            event.setSilkCar(it);
//            final Single<Workshop> workshop$ = workshopRepository.find(command.getWorkshop().getId());
//            return SilkCarModel.physicalInfo(Single.just(it), workshop$).flatMap(silkCarModel -> silkCarModel.generateSilkRuntimes(command.getCheckSilks()));
//        }).flatMap(it -> {
//            event.setSilkRuntimes(it);
//            return gradeRepository.find(command.getGrade().getId());
//        }).flatMap(grade -> {
//            event.setGrade(grade);
//            return operatorRepository.find(principal);
//        }).flatMap(it -> {
//            event.fire(it);
//            return doffing(event, DoffingType.PHYSICAL_INFO);
//        });
//    }
//
//    @Override
//    public Single<List<CheckSilkDTO>> handle(Principal principal, SilkCarRuntimeAppendEvent.CheckSilksCommand command) {
//        final Single<SilkCarRuntime> silkCarRuntime$ = find(command.getSilkCarRecord());
//        final Single<List<CheckSilkDTO>> result$ = SilkCarModel.append(silkCarRuntime$, command.getLineMachineCount()).flatMap(SilkCarModel::checkSilks);
//        final Completable checks$ = authService.checkRole(principal, RoleType.DOFFING);
//        return checks$.andThen(result$);
//    }
//
//    @Override
//    public Single<SilkCarRuntime> handle(Principal principal, SilkCarRuntimeInitEvent.CarpoolCommand command) {
//        final SilkCarRuntimeInitEvent event = new SilkCarRuntimeInitEvent();
//        event.setCommand(MAPPER.convertValue(command, JsonNode.class));
//        return silkCarRepository.findByCode(command.getSilkCar().getCode()).flatMap(it -> {
//            event.setSilkCar(it);
//            return SilkCarModel.carpool(Single.just(it)).flatMap(silkCarModel -> silkCarModel.generateSilkRuntimes(command.getCheckSilks()));
//        }).flatMap(it -> {
//            event.setSilkRuntimes(it);
//            return gradeRepository.find(command.getGrade().getId());
//        }).flatMap(grade -> {
//            event.setGrade(grade);
//            return operatorRepository.find(principal);
//        }).flatMap(it -> {
//            event.fire(it);
//            return carpool(event);
//        });
//    }
//
//    private Single<SilkCarRuntime> carpool(SilkCarRuntimeInitEvent event) {
//        final SilkCar silkCar = event.getSilkCar();
//        final Collection<SilkRuntime> silkRuntimes = event.getSilkRuntimes();
//        final Grade grade = event.getGrade();
//        final Single<SilkCarRuntime> result$ = silkCarRecordRepository.create().flatMap(silkCarRecord -> {
//            silkCarRecord.initEvent(event);
//            silkCarRecord.setSilkCar(silkCar);
//            silkCarRecord.setGrade(grade);
//            silkCarRecord.setBatch(checkAndGetBatch(silkRuntimes));
//            silkCarRecord.setCarpoolOperator(event.getOperator());
//            silkCarRecord.setCarpoolDateTime(event.getFireDateTime());
//            return silkCarRuntimeRepository.create(silkCarRecord, silkRuntimes);
//        });
//        final Completable checks$ = Completable.mergeArray(
//                // todo 满车才能拼车
//                handlePrevSilkCarData(silkCar)
//        );
//        return checks$.andThen(result$);
//    }
//
//    private Completable checkSilkDuplicate(Collection<SilkRuntime> silkRuntimes) {
//        return Flowable.fromIterable(J.emptyIfNull(silkRuntimes))
//                .map(SilkRuntime::getSilk)
//                .map(Silk::getCode)
//                .map(SilkBarcodeService::silkCodeToSilkBarCode).distinct()
//                .map(it -> it + "01")
//                .flatMapMaybe(silkRepository::findByCode).toList()
//                .flatMapCompletable(silks -> {
//                    if (J.nonEmpty(silks)) {
//                        throw new SilkDuplicateException();
//                    }
//                    return Completable.complete();
//                });
//    }
//
//    private Completable handlePrevSilkCarData(SilkCar silkCar) {
//        final String code = silkCar.getCode();
//        return silkCarRuntimeRepository.findByCode(code).flatMapCompletable(silkCarRuntime -> {
//            if (J.nonEmpty(silkCarRuntime.getSilkRuntimes()) && !silkCarRuntime.hasPackageBoxEvent()) {
//                throw new SilkCarNonEmptyException(silkCar);
//            }
//            final Completable clearSilkCar$ = silkCarRuntimeRepository.clearSilkCarRuntime(code);
//            return silkCarRecordService.save(silkCarRuntime).flatMapCompletable(it -> clearSilkCar$);
//        });
//    }
//
//    @Override
//    public Completable handle(SilkCarRuntime silkCarRuntime, SilkCarRuntimeGradeEvent event) {
//        final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
//        final String code = silkCarRecord.getSilkCar().getCode();
//        silkCarRecord.setGrade(event.getGrade());
//        final Completable addEventSource$ = silkCarRuntimeRepository.addEventSource(code, event);
//        return silkCarRecordRepository.save(silkCarRecord).ignoreElement().andThen(addEventSource$);
//    }
//
//    @Override
//    public Completable handle(SilkCarRuntime silkCarRuntime, SilkCarRuntimeGradeSubmitEvent event) {
//        final String code = silkCarRuntime.getSilkCarRecord().getSilkCar().getCode();
//        return silkCarRuntimeRepository.addEventSource(code, event);
//    }
//
//    @Override
//    public Completable handle(SilkCarRuntime silkCarRuntime, ProductProcessSubmitEvent event) {
//        final String code = silkCarRuntime.getSilkCarRecord().getSilkCar().getCode();
//        final Completable checks$ = authService.checkProductProcessSubmit(event.getOperator(), event.getProductProcess());
//        return checks$.andThen(silkCarRuntimeRepository.addEventSource(code, event));
//    }
//
//    @Override
//    public Completable handle(SilkCarRuntime silkCarRuntime, ExceptionCleanEvent event) {
//        final String code = silkCarRuntime.getSilkCarRecord().getSilkCar().getCode();
//        return silkCarRuntimeRepository.addEventSource(code, event);
//    }
//
//    @Override
//    public Completable handle(SilkCarRuntime silkCarRuntime, DyeingSampleSubmitEvent event) {
//        final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
//        final String code = silkCarRecord.getSilkCar().getCode();
//        final Completable result$ = Flowable.fromIterable(event.getSilkRuntimes()).flatMapSingle(silkRuntime -> {
//            final Silk silk = silkRuntime.getSilk();
//            silk.setDyeingSample(true);
//            return silkRepository.save(silk);
//        }).flatMapCompletable(silk -> dyeingSampleRepository.findOrCreateBy(silk).flatMapCompletable(dyeingSample -> {
//            dyeingSample.setSilk(silk);
//            dyeingSample.setCode(silk.getCode());
//            dyeingSample.setDeleted(false);
//            dyeingSample.log(event.getOperator(), event.getFireDateTime());
//            return dyeingSampleRepository.save(dyeingSample).ignoreElement();
//        }));
//        final Completable addEventSource$ = silkCarRuntimeRepository.addEventSource(code, event);
//        final Completable checks$ = authService.checkRole(event.getOperator(), RoleType.SUBMIT_DYEING_PREPARE);
//        return checks$.andThen(result$).andThen(addEventSource$);
//    }
//
//    @Override
//    public Completable handle(SilkCarRuntime silkCarRuntime, SilkRuntimeDetachEvent event) {
//        final String code = silkCarRuntime.getSilkCarRecord().getSilkCar().getCode();
//        final Completable completable = Flowable.fromIterable(event.getSilkRuntimes()).map(SilkRuntime::getSilk).flatMapCompletable(silk -> {
//            silk.setDetached(true);
//            return silkRepository.save(silk).ignoreElement();
//        });
//        return completable.andThen(silkCarRuntimeRepository.addEventSource(code, event));
//    }
//
//    @Override
//    public Completable handle(SilkCarRuntime silkCarRuntime, TemporaryBoxEvent event) {
//        final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
//        final SilkCar silkCar = silkCarRecord.getSilkCar();
//        final List<Silk> silks = J.emptyIfNull(silkCarRuntime.getSilkRuntimes()).stream()
//                .map(silkRuntime -> {
//                    final Silk silk = silkRuntime.getSilk();
//                    silk.setGrade(silkRuntime.getGrade());
//                    silk.setExceptions(silkRuntime.getExceptions());
//                    return silk;
//                }).collect(Collectors.toList());
//        if (J.isEmpty(silks)) {
//            return Completable.error(new SilkCarStatusException(silkCar));
//        }
//        final Set<Grade> grades = silks.stream().map(Silk::getGrade).collect(Collectors.toSet());
//        if (grades.size() != 1) {
//            return Completable.error(new MultiGradeException());
//        }
//        final Set<Batch> batches = silks.stream().map(Silk::getBatch).collect(Collectors.toSet());
//        if (batches.size() != 1) {
//            return Completable.error(new MultiBatchException());
//        }
//        final Batch batch = IterableUtils.get(batches, 0);
//        final Grade grade = IterableUtils.get(grades, 0);
//
//        final String code = silkCar.getCode();
//        final TemporaryBoxRecord temporaryBoxRecord = event.getTemporaryBoxRecord();
//        temporaryBoxRecord.log(event.getOperator(), event.getFireDateTime());
//        temporaryBoxRecord.setSilkCarRecord(silkCarRecord);
//        temporaryBoxRecord.setSilks(silks);
//        temporaryBoxRecord.setCount(silks.size());
//        final TemporaryBox temporaryBox = temporaryBoxRecord.getTemporaryBox();
//        if (!Objects.equals(batch, temporaryBox.getBatch())) {
//            return Completable.error(new MultiBatchException());
//        }
//        if (!Objects.equals(grade, temporaryBox.getGrade())) {
//            return Completable.error(new MultiGradeException());
//        }
//
//        final Completable result$ = temporaryBoxRecordRepository.save(temporaryBoxRecord).flatMapCompletable(it -> {
//            event.setTemporaryBoxRecord(it);
//            return Completable.complete();
//        });
//        final Completable addEventSource$ = silkCarRuntimeRepository.addEventSource(code, event);
//        return result$.andThen(addEventSource$);
//    }
//
//    @Override
//    public Completable handle(DyeingPrepareEvent event, SilkCarRuntime silkCarRuntime, Collection<SilkRuntime> silkRuntimes) {
//        final boolean present = silkCarRuntime.getEventSources().stream()
//                .filter(eventSource -> !eventSource.isDeleted() && eventSource.getType() == event.getType())
//                .filter(eventSource -> {
//                    final DyeingPrepare dyeingPrepare = event.getDyeingPrepare();
//                    final DyeingPrepareEvent oldEvent = (DyeingPrepareEvent) eventSource;
//                    final DyeingPrepare oldDyeingPrepare = oldEvent.getDyeingPrepare();
//                    if (dyeingPrepare.getType() != oldDyeingPrepare.getType()) {
//                        return false;
//                    }
//                    final SilkRuntime silkRuntime = IterableUtils.get(silkRuntimes, 0);
//                    final Silk silk = silkRuntime.getSilk();
//                    final LineMachine lineMachine = silk.getLineMachine();
//                    final String doffingNum = silk.getDoffingNum();
//                    final Silk oldSilk = IterableUtils.get(oldDyeingPrepare.getSilks(), 0);
//                    final LineMachine oldLineMachine = oldSilk.getLineMachine();
//                    final String oldDoffingNum = oldSilk.getDoffingNum();
//                    return Objects.equals(lineMachine, oldLineMachine) && Objects.equals(doffingNum, oldDoffingNum);
//                }).findFirst().isPresent();
//        if (present) {
//            throw new RuntimeException("已织袜");
//        }
//
//        return dyeingService.create(, event.getDyeingPrepare(), silkCarRuntime, silkRuntimes).flatMapCompletable(dyeingPrepare -> {
//            event.setDyeingPrepare(dyeingPrepare);
//            final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
//            final String code = silkCarRecord.getSilkCar().getCode();
//            return silkCarRuntimeRepository.addEventSource(code, event);
//        });
//    }
//
//    @Override
//    public Completable handle(DyeingPrepareEvent event, SilkCarRuntime silkCarRuntime1, Collection<SilkRuntime> silkRuntimes1, SilkCarRuntime silkCarRuntime2, Collection<SilkRuntime> silkRuntimes2) {
//        return dyeingService.create(event.getDyeingPrepare(), silkCarRuntime1, silkRuntimes1, silkCarRuntime2, silkRuntimes2).flatMapCompletable(dyeingPrepare -> {
//            event.setDyeingPrepare(dyeingPrepare);
//            final String code1 = silkCarRuntime1.getSilkCarRecord().getSilkCar().getCode();
//            final String code2 = silkCarRuntime2.getSilkCarRecord().getSilkCar().getCode();
//            final Completable addEventSource1$ = silkCarRuntimeRepository.addEventSource(code1, event);
//            final Completable addEventSource2$ = silkCarRuntimeRepository.addEventSource(code2, event);
//            return Completable.mergeArray(addEventSource1$, addEventSource2$);
//        });
//    }
//
//    @Override
//    public Completable handle(Principal principal, SilkNoteFeedbackEvent.Command command) {
//        return command.toEvent(principal).flatMapCompletable(event -> find(command.getSilkCarRecord()).flatMapCompletable(silkCarRuntime -> {
//            final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
//            final SilkCar silkCar = silkCarRecord.getSilkCar();
//            return silkCarRuntimeRepository.addEventSource(silkCar.getCode(), event);
//        }));
//    }

}
