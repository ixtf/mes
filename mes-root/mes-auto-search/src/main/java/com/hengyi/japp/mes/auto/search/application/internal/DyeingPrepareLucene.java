package com.hengyi.japp.mes.auto.search.application.internal;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import com.hengyi.japp.mes.auto.domain.Batch;
import com.hengyi.japp.mes.auto.domain.DyeingPrepare;
import com.hengyi.japp.mes.auto.domain.Silk;
import com.hengyi.japp.mes.auto.domain.SilkCarRecord;
import com.hengyi.japp.mes.auto.query.DyeingPrepareQuery;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.lucene.document.Document;
import org.apache.lucene.facet.FacetsConfig;
import org.apache.lucene.search.BooleanQuery;

import java.nio.file.Path;
import java.util.Collection;

import static com.github.ixtf.persistence.lucene.Jlucene.*;

/**
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
public class DyeingPrepareLucene extends BaseLucene<DyeingPrepare> {

    @Inject
    private DyeingPrepareLucene(@Named("lucenePath") Path lucenePath, Jmongo jmongo) {
        super(lucenePath, jmongo);
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

        final Collection<SilkCarRecord> silkCarRecords = dyeingPrepare.prepareSilkCarRecords();
        final Collection<Silk> silks = dyeingPrepare.prepareSilks();
        silkCarRecords.stream()
                .map(SilkCarRecord::getSilkCar).distinct()
                .forEach(silkCar -> add(doc, "silkCar", silkCar));
        silkCarRecords.stream()
                .map(SilkCarRecord::getBatch).distinct()
                .peek(it -> add(doc, "batch", it))
                .map(Batch::getWorkshop).distinct()
                .forEach(it -> add(doc, "workshop", it));
        silks.stream()
                .peek(it -> add(doc, "silk", it))
                .map(Silk::getLineMachine).distinct()
                .forEach(it -> add(doc, "lineMachine", it));
        silks.stream().map(Silk::getDoffingNum).distinct().forEach(it -> add(doc, "doffingNum", it));
        return doc;
    }

    public Pair<Integer, Collection<String>> query(DyeingPrepareQuery query) {
        final BooleanQuery.Builder builder = new BooleanQuery.Builder();
        add(builder, "workshop", query.getWorkshopId());
        add(builder, "silkCar", query.getSilkCarId());
        add(builder, "creator", query.getCreatorId());
        add(builder, "lineMachine", query.getLineMachineId());
        add(builder, "doffingNum", query.getDoffingNum());
        add(builder, "silk", query.getSilkId());
        add(builder, "submitted", query.isSubmitted());
        add(builder, "createDateTime", query.getStartDate(), query.getEndDate());
        return query(builder.build(), query.getFirst(), query.getPageSize());
    }
}
