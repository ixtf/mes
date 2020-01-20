package com.hengyi.japp.mes.auto.report.application;

import com.github.ixtf.japp.core.J;
import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.inject.ImplementedBy;
import com.hengyi.japp.mes.auto.GuiceModule;
import com.hengyi.japp.mes.auto.application.*;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import com.hengyi.japp.mes.auto.report.application.internal.QueryServiceImpl;
import com.mongodb.reactivestreams.client.MongoCollection;
import lombok.SneakyThrows;
import org.apache.commons.lang3.tuple.Pair;
import org.bson.Document;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.Collection;
import java.util.Optional;

import static com.mongodb.client.model.Filters.eq;

/**
 * @author jzb 2019-05-20
 */
@ImplementedBy(QueryServiceImpl.class)
public interface QueryService {
    String ID_COL = "_id";
    LoadingCache<Pair<Class, String>, Optional<Document>> CACHE = CacheBuilder.newBuilder()
            .maximumSize(100000)
            .build(new CacheLoader<>() {
                @Override
                public Optional<Document> load(Pair<Class, String> pair) throws Exception {
                    final Class entityClass = pair.getLeft();
                    final String id = pair.getRight();
                    return QueryService.find(entityClass, id).blockOptional();
                }
            });

    @SneakyThrows
    static Optional<Document> findFromCache(Class<?> clazz, String id) {
        return J.isBlank(id) ? Optional.empty() : CACHE.get(Pair.of(clazz, id));
    }

    @SneakyThrows
    static Optional<Document> findFromCache(Class<?> clazz, EntityDTO dto) {
        return findFromCache(clazz, dto.getId());
    }

    static Mono<Document> find(Class<?> clazz, String id) {
        final Jmongo jmongo = GuiceModule.getInstance(Jmongo.class);
        final MongoCollection<Document> collection = jmongo.collection(clazz);
        return Mono.from(collection.find(eq(ID_COL, id)));
    }

    static Mono<Document> find(Class<?> clazz, EntityDTO dto) {
        return find(clazz, dto.getId());
    }

    Collection<String> querySilkCarRecordIds(String workshopId, long startL, long endL);

    Collection<String> querySilkCarRecordIdsByEventSourceCanHappen(String workshopId, long startDateTime, long endDateTime);

    Collection<String> queryPackageBoxIds(String workshopId, LocalDate startBudat, LocalDate endBudat);

    Collection<String> queryPackageBoxIds(String workshopId, long startDateTime, long endDateTime);

    String url(String url);

    Pair<Long, Collection<String>> query(String uri, Object query);


    default Pair<Long, Collection<String>> query(PackageBoxQuery query) {
        return query(url("packageBoxes"), query);
    }

    default Pair<Long, Collection<String>> query(SilkBarcodeQuery query) {
        return query(url("silkBarcodes"), query);
    }

    default Pair<Long, Collection<String>> query(SilkCarRecordQuery query) {
        return query(url("silkCarRecords"), query);
    }

    Collection<String> query(SilkCarRecordQueryByEventSourceCanHappen query);

    default Pair<Long, Collection<String>> query(DyeingPrepareQuery query) {
        return query(url("dyeingPrepares"), query);
    }

}
