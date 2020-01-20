package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.query.SilkCarRecordQuery;
import com.hengyi.japp.mes.auto.domain.SilkCar;
import com.hengyi.japp.mes.auto.domain.SilkCarRecord;
import com.hengyi.japp.mes.auto.dto.SilkCarRecordDTO;
import com.hengyi.japp.mes.auto.event.EventSource;
import com.hengyi.japp.mes.auto.repository.SilkCarRecordRepository;
import com.hengyi.japp.mes.auto.repository.SilkCarRepository;
import com.hengyi.japp.mes.auto.search.application.internal.SilkCarRecordLucene;
import lombok.SneakyThrows;
import org.apache.commons.lang3.tuple.Pair;
import org.eclipse.microprofile.reactive.streams.operators.ReactiveStreams;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CompletionStage;

/**
 * @author jzb 2018-06-25
 */
@Singleton
public class SilkCarRecordRepositoryMongo extends MongoEntityRepository<SilkCarRecord> implements SilkCarRecordRepository {
    private final SilkCarRecordLucene lucene;
    private final JedisPool jedisPool;
    private final SilkCarRepository silkCarRepository;

    @Inject
    private SilkCarRecordRepositoryMongo(SilkCarRecordLucene lucene, JedisPool jedisPool, SilkCarRepository silkCarRepository) {
        this.lucene = lucene;
        this.jedisPool = jedisPool;
        this.silkCarRepository = silkCarRepository;
    }

    @Override
    public SilkCarRecord save(SilkCarRecord silkCarRecord) {
        final SilkCarRecord result = super.save(silkCarRecord);
        lucene.index(result);
        return result;
    }

    @SneakyThrows
    @Override
    public Optional<SilkCarRuntime> find(SilkCarRecordDTO dto) {
        final SilkCar silkCar = silkCarRepository.find(dto.getSilkCar()).get();
        try (Jedis jedis = jedisPool.getResource()) {
            final Map<String, String> map = jedis.hgetAll("");
        }
        return findSilkCarRuntime(silkCar).filter(silkCarRuntime -> {
            final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
            return Objects.equals(silkCar, silkCarRecord.getSilkCar()) && Objects.equals(dto.getId(), silkCarRecord.getId());
        });
//        return silkCar
//                .map(SilkCar::getCode)
//                .flatMapMaybe(silkCarRuntimeRepository::findByCode).toSingle()
//                .map(silkCarRuntime -> {
//                    final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
//                    final SilkCar silkCar = silkCarRecord.getSilkCar();
//                    if (Objects.equals(dto.getId(), silkCarRecord.getId())) {
//                        return silkCarRuntime;
//                    }
//                    throw new SilkCarStatusException(silkCar);
//                });
    }

    @Override
    public Optional<SilkCarRuntime> findSilkCarRuntime(String code) {
        return null;
    }

    @Override
    public CompletionStage<SilkCarRecordQuery.Result> query(SilkCarRecordQuery silkCarRecordQuery) {
        final int first = silkCarRecordQuery.getFirst();
        final int pageSize = silkCarRecordQuery.getPageSize();
        final SilkCarRecordQuery.Result.ResultBuilder builder = SilkCarRecordQuery.Result.builder().first(first).pageSize(pageSize);
        return ReactiveStreams.of(silkCarRecordQuery)
                .map(lucene::build)
                .map(it -> lucene.baseQuery(it, first, pageSize))
                .peek(it -> builder.count(it.getKey()))
                .map(Pair::getValue)
                .flatMap(ids -> Jmongo.listById(entityClass, ids))
                .toList().run()
                .thenApply(silkBarcodes -> builder.silkCarRecords(silkBarcodes).build());
    }

    @Override
    public void delete(SilkCarRecord silkCarRecord) {
        if (silkCarRecord.getCarpoolDateTime() != null) {
            throw new RuntimeException("拼车,无法删除");
        }
//        final SilkRepository silkRepository = Jvertx.getProxy(SilkRepository.class);
//
//        final Completable delSilkCarRecord$ = silkCarRecord._delete().doOnComplete(() -> lucene.delete(silkCarRecord.getId()));
//        final Completable delSilks$ = Flowable.fromIterable(silkCarRecord.initSilks())
//                .map(SilkRuntime::getSilk)
//                .flatMapCompletable(silkRepository::delete);
//        return Completable.mergeArray(delSilkCarRecord$, delSilks$);
    }

    @Override
    public void addEventSource(SilkCarRuntime silkCarRuntime, EventSource event) {

    }


//    @Override
//    public SilkCarRuntime create(SilkCarRecord silkCarRecord_, Collection<SilkRuntime> silkRuntimes_) {
//        return silkCarRecordRepository.save(silkCarRecord_).flatMap(silkCarRecord -> {
//            /**
//             * 保存丝锭
//             * 注意：先保存 silkCarRecord
//             */
//            return Flowable.fromIterable(silkRuntimes_).flatMapSingle(silkRuntime -> {
//                final Silk silk_ = silkRuntime.getSilk();
//                // 考虑到拼车情况，
//                Collection<SilkCarRecord> silkCarRecords = J.emptyIfNull(silk_.getSilkCarRecords());
//                silkCarRecords = Lists.newArrayList(silkCarRecords);
//                if (!silkCarRecords.contains(silkCarRecord)) {
//                    silkCarRecords.add(silkCarRecord);
//                }
//                silk_.setSilkCarRecords(silkCarRecords);
//                return silkRepository.save(silk_).map(silk -> {
//                    silkRuntime.setSilk(silk);
//                    return silkRuntime;
//                });
//            }).toList().map(silkRuntimes -> {
//                final SilkCarRuntime silkCarRuntime = new SilkCarRuntime();
//                silkCarRuntime.setSilkCarRecord(silkCarRecord);
//                silkCarRuntime.setSilkRuntimes(silkRuntimes);
//                return silkCarRuntime;
//            });
//        }).flatMap(silkCarRuntime -> {
//            final String redisKey = SilkCarRuntimeRepository.redisKey(silkCarRuntime);
//            final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
//            final JsonObject redisJson = new JsonObject().put("silkCarRecord", silkCarRecord.getId());
//            final Completable save$ = redisClient.rxHmset(redisKey, redisJson).ignoreElement();
//            return save$.toSingleDefault(silkCarRuntime);
//        });
//    }

//    @Override
//    public Completable clearSilkCarRuntime(String code) {
//        return redisClient.rxDel(SilkCarRuntimeRepository.redisKey(code)).ignoreElement();
//    }
//
//    @Override
//    public Maybe<SilkCarRuntime> findByCode(String code) {
//        return redisClient.rxHgetall(SilkCarRuntimeRepository.redisKey(code))
//                .filter(it -> !it.isEmpty())
//                .flatMapSingleElement(this::fromRedisJson);
//    }
//
//    private Single<SilkCarRuntime> fromRedisJson(JsonObject redisJson) {
//        final SilkCarRuntime silkCarRuntime = new SilkCarRuntime();
//        return silkCarRecordRepository.find(redisJson.getString("silkCarRecord")).flatMap(silkCarRecord -> {
//            silkCarRuntime.setSilkCarRecord(silkCarRecord);
//            return Flowable.fromIterable(redisJson.fieldNames())
//                    .filter(it -> it.startsWith(EVENT_SOURCE_KEY_PREFIX))
//                    .map(redisJson::getString)
//                    .map(MAPPER::readTree)
//                    .flatMapSingle(EventSource::from).sorted().toList()
//                    .flatMap(eventSources -> {
//                        silkCarRuntime.setEventSources(eventSources);
//                        Collection<SilkRuntime> silkRuntimes = silkCarRecord.initSilks();
//                        J.emptyIfNull(silkRuntimes).forEach(silkRuntime -> {
//                            final Grade grade = silkCarRecord.getGrade();
//                            silkRuntime.setGrade(grade);
//                        });
//                        for (EventSource eventSource : eventSources) {
//                            silkRuntimes = eventSource.calcSilkRuntimes(silkRuntimes);
//                        }
//                        J.emptyIfNull(silkRuntimes).forEach(silkRuntime -> {
//                            if (silkRuntime.getGrade() == null) {
//                                // 拼车没有预设等级，沿用丝车的等级
//                                final Grade grade = silkCarRecord.getGrade();
//                                silkRuntime.setGrade(grade);
//                            }
//                        });
//
//                        final Batch batch = silkCarRecord.getBatch();
//                        final Product product = batch.getProduct();
//                        if (product.getDyeingFormConfig() == null) {
//                            silkCarRuntime.setSilkRuntimes(silkRuntimes);
//                            return Single.fromCallable(() -> silkCarRuntime);
//                        }
//
//                        final Flowable<SilkRuntime> silkRuntimeFlowable;
//                        if (silkCarRecord.getDoffingType() != null) {
//                            silkRuntimeFlowable = Flowable.fromIterable(silkRuntimes).flatMapSingle(this::calcTimelineDyeingException);
//                        } else {
//                            silkRuntimeFlowable = Flowable.fromIterable(silkRuntimes);
//                        }
//                        return silkRuntimeFlowable.doOnNext(silkRuntime -> {
//                            if (silkRuntime.getGrade() == null) {
//                                // 拼车没有预设等级，沿用丝车的等级
//                                silkRuntime.setGrade(silkCarRecord.getGrade());
//                            }
//                        }).toList().map(it -> {
//                            it.forEach(SilkRuntime::calcDyeing);
//                            silkCarRuntime.setSilkRuntimes(it);
//                            return silkCarRuntime;
//                        });
//                    });
//        });
//    }
//
//    private Single<SilkRuntime> calcTimelineDyeingException(SilkRuntime silkRuntime) {
//        // 这辆丝车发生过织袜
//        if (J.nonEmpty(silkRuntime.getDyeingResultCalcModel().getDyeingResults())) {
//            return Single.just(silkRuntime);
//        }
//        final Silk silk = silkRuntime.getSilk();
//        final LineMachine lineMachine = silk.getLineMachine();
//        final int spindle = silk.getSpindle();
//        final String firstDyeingKey = DyeingService.firstDyeingKey(lineMachine, spindle);
//
//        return calcTimelineDyeingException(firstDyeingKey, silkRuntime).flatMap(it -> {
//            final String crossDyeingKey = DyeingService.crossDyeingKey(lineMachine, spindle);
//            return calcTimelineDyeingException(crossDyeingKey, silkRuntime);
//        });
//    }
//
//    private Single<SilkRuntime> calcTimelineDyeingException(String key, SilkRuntime silkRuntime) {
//        return redisClient.rxHgetall(key).flatMap(it -> {
//            if (it.isEmpty()) {
////                silkRuntime.setDyeingResultSubmitted(false);
////                silkRuntime.setHasDyeingException(true);
//                return Single.just(silkRuntime);
//            }
//            return DyeingResult.fromRedis(it).map(dyeingResult -> dyeingResult.fillData(silkRuntime));
//        });
//    }
//
//    @Override
//    public Completable addEventSource(String code, EventSource eventSource) {
//        return Single.fromCallable(() -> {
//            final String eventSourceKey = EVENT_SOURCE_KEY_PREFIX + eventSource.getEventId();
//            final JsonNode jsonNode = eventSource.toJsonNode();
//            final String eventSourceValue = MAPPER.writeValueAsString(jsonNode);
//            return new JsonObject().put(eventSourceKey, eventSourceValue);
//        }).flatMapCompletable(it -> {
//            final String redisKey = SilkCarRuntimeRepository.redisKey(code);
//            return redisClient.rxHmset(redisKey, it).ignoreElement();
//        });
//    }
//
//    @Override
//    public Completable delete(SilkCarRuntime silkCarRuntime) {
//        final SilkCarRecord silkCarRecord = silkCarRuntime.getSilkCarRecord();
//        final SilkCar silkCar = silkCarRecord.getSilkCar();
//        final String redisKey = SilkCarRuntimeRepository.redisKey(silkCar.getCode());
//        final Completable delSilkCarRecord$ = silkCarRecordRepository.delete(silkCarRecord);
//        final Completable delSilkCarRuntime$ = redisClient.rxDel(redisKey).ignoreElement();
//        return delSilkCarRecord$.andThen(delSilkCarRuntime$);
//    }

}
