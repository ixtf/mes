package com.hengyi.japp.mes.auto.search.application.internal;

import com.github.ixtf.persistence.lucene.BaseLucene;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.*;
import com.hengyi.japp.mes.auto.query.DyeingPrepareQuery;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.lucene.document.Document;
import org.apache.lucene.facet.FacetsConfig;
import org.apache.lucene.search.BooleanQuery;

import javax.inject.Named;
import java.nio.file.Path;
import java.util.Collection;
import java.util.stream.Stream;

import static com.github.ixtf.persistence.lucene.Jlucene.*;
import static java.util.stream.Collectors.toSet;

/**
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
public class DyeingPrepareLucene extends BaseLucene<DyeingPrepare> {

    @Inject
    private DyeingPrepareLucene(@Named("luceneRootPath") Path luceneRootPath) {
        super(luceneRootPath);
    }

    @Override
    protected FacetsConfig facetsConfig() {
        final FacetsConfig result = new FacetsConfig();
        result.setIndexFieldName("workshop", "workshop");
        result.setIndexFieldName("type", "type");
        result.setIndexFieldName("batch", "batch");
        return result;
    }

    protected Document document(DyeingPrepare dyeingPrepare) {
        final Document doc = doc(dyeingPrepare);
        add(doc, "type", dyeingPrepare.getType());
        addFacet(doc, "type", dyeingPrepare.getType());
        add(doc, "creator", dyeingPrepare.getCreator());
        add(doc, "createDateTime", dyeingPrepare.getCreateDateTime());
        add(doc, "submitted", dyeingPrepare.isSubmitted());
        add(doc, "submitter", dyeingPrepare.getSubmitter());
        add(doc, "submitDateTime", dyeingPrepare.getSubmitDateTime());

        Stream.concat(
                dyeingPrepare.prepareSilkCarRecords().stream().peek(silkCarRecord -> {
                    add(doc, "silkCarRecord", silkCarRecord);
                    final SilkCar silkCar = silkCarRecord.getSilkCar();
                    add(doc, "silkCar", silkCar);
                }).map(SilkCarRecord::getBatch),
                dyeingPrepare.prepareSilks().stream().peek(silk -> add(doc, "silks", silk)).map(Silk::getBatch)
        ).distinct().forEach(batch -> {
            add(doc, "batch", batch);
            final Workshop workshop = batch.getWorkshop();
            add(doc, "workshop", workshop);
        });

        dyeingPrepare.prepareSilks().stream().map(Silk::getLineMachine).collect(toSet()).forEach(it -> {
            add(doc, "lineMachine", it);
        });
        return doc;
    }

    public Pair<Long, Collection<String>> query(DyeingPrepareQuery query) {
        final BooleanQuery.Builder builder = new BooleanQuery.Builder();
        add(builder, "workshop", query.getWorkshopId());
        add(builder, "silkCar", query.getSilkCarId());
        add(builder, "creator", query.getCreatorId());
        add(builder, "lineMachine", query.getLineMachineId());
        add(builder, "submitted", query.isSubmitted());
        add(builder, "createDateTime", query.getStartDate(), query.getEndDate());
        return query(builder.build(), query.getFirst(), query.getPageSize());
    }
}
