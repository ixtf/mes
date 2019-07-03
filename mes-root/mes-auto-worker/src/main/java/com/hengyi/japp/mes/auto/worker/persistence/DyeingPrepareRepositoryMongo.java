package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.query.DyeingPrepareQuery;
import com.hengyi.japp.mes.auto.application.query.DyeingPrepareResultQuery;
import com.hengyi.japp.mes.auto.domain.DyeingPrepare;
import com.hengyi.japp.mes.auto.repository.DyeingPrepareRepository;
import com.hengyi.japp.mes.auto.search.lucene.DyeingPrepareLucene;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.SortField;
import org.apache.lucene.search.SortedNumericSortField;
import org.eclipse.microprofile.reactive.streams.operators.ReactiveStreams;

import java.util.concurrent.CompletionStage;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class DyeingPrepareRepositoryMongo extends MongoEntityRepository<DyeingPrepare> implements DyeingPrepareRepository {
    private final DyeingPrepareLucene dyeingPrepareLucene;

    @Inject
    private DyeingPrepareRepositoryMongo(DyeingPrepareLucene dyeingPrepareLucene) {
        this.dyeingPrepareLucene = dyeingPrepareLucene;
    }

    @Override
    public DyeingPrepare save(DyeingPrepare dyeingPrepare) {
        final DyeingPrepare result = super.save(dyeingPrepare);
        dyeingPrepareLucene.index(result);
        return result;
    }

    @Override
    public CompletionStage<DyeingPrepareQuery.Result> query(DyeingPrepareQuery dyeingPrepareQuery) {
        final int first = dyeingPrepareQuery.getFirst();
        final int pageSize = dyeingPrepareQuery.getPageSize();
        final DyeingPrepareQuery.Result.ResultBuilder builder = DyeingPrepareQuery.Result.builder().first(first).pageSize(pageSize);
        final Sort sort = new Sort(new SortedNumericSortField("createDateTime", SortField.Type.LONG, true));
        return ReactiveStreams.of(dyeingPrepareQuery)
                .map(dyeingPrepareLucene::build)
                .map(it -> dyeingPrepareLucene.baseQuery(it, first, pageSize, sort))
                .peek(it -> builder.count(it.getKey()))
                .map(Pair::getValue)
                .flatMap(ids -> Jmongo.listById(entityClass, ids))
                .toList().run()
                .thenApply(dyeingPrepares -> builder.dyeingPrepares(dyeingPrepares).build());
    }

    @Override
    public CompletionStage<DyeingPrepareResultQuery.Result> query(DyeingPrepareResultQuery dyeingPrepareResultQuery) {
        final int first = dyeingPrepareResultQuery.getFirst();
        final int pageSize = dyeingPrepareResultQuery.getPageSize();
        final DyeingPrepareResultQuery.Result.ResultBuilder builder = DyeingPrepareResultQuery.Result.builder().first(first).pageSize(pageSize);
        final Sort sort = new Sort(new SortedNumericSortField("createDateTime", SortField.Type.LONG, true));
        return ReactiveStreams.of(dyeingPrepareResultQuery)
                .map(dyeingPrepareLucene::build)
                .map(it -> dyeingPrepareLucene.baseQuery(it, first, pageSize, sort))
                .peek(it -> builder.count(it.getKey()))
                .map(Pair::getValue)
                .flatMap(ids -> Jmongo.listById(DyeingPrepare.class, ids))
                .toList().run()
                .thenApply(dyeingPrepares -> builder.dyeingPrepares(dyeingPrepares).build());
    }

}
