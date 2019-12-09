package com.hengyi.japp.mes.auto.search.application.internal;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import com.hengyi.japp.mes.auto.domain.Batch;
import com.hengyi.japp.mes.auto.domain.SilkCar;
import com.hengyi.japp.mes.auto.domain.SilkCarRecord;
import com.hengyi.japp.mes.auto.domain.Workshop;
import com.hengyi.japp.mes.auto.query.SilkCarRecordQuery;
import com.hengyi.japp.mes.auto.query.SilkCarRecordQueryByEventSourceCanHappen;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.LongPoint;
import org.apache.lucene.facet.FacetsConfig;
import org.apache.lucene.search.BooleanQuery;

import java.nio.file.Path;
import java.util.Collection;
import java.util.Date;

import static com.github.ixtf.persistence.lucene.Jlucene.*;
import static org.apache.lucene.search.BooleanClause.Occur.MUST_NOT;

/**
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
public class SilkCarRecordLucene extends BaseLucene<SilkCarRecord> {

    @Inject
    private SilkCarRecordLucene(@Named("lucenePath") Path lucenePath, Jmongo jmongo) {
        super(lucenePath, jmongo);
    }

    @Override
    protected FacetsConfig facetsConfig() {
        final FacetsConfig result = new FacetsConfig();
        result.setIndexFieldName("workshop", "workshop");
        result.setIndexFieldName("batch", "batch");
        result.setIndexFieldName("doffingType", "doffingType");
        return result;
    }

    protected Document document(SilkCarRecord silkCarRecord) {
        final Document doc = doc(silkCarRecord);
        add(doc, "doffingType", silkCarRecord.getDoffingType());
        addFacet(doc, "doffingType", silkCarRecord.getDoffingType());
        add(doc, "startDateTime", silkCarRecord.getStartDateTime());
        add(doc, "endDateTime", silkCarRecord.getEndDateTime());

        final SilkCar silkCar = silkCarRecord.getSilkCar();
        add(doc, "silkCar", silkCar);
        add(doc, "silkCar", silkCar.getCode());

        final Batch batch = silkCarRecord.getBatch();
        add(doc, "batch", batch);
        addFacet(doc, "batch", batch);

        final Workshop workshop = batch.getWorkshop();
        add(doc, "workshop", workshop);
        addFacet(doc, "workshop", workshop);
        return doc;
    }

    public Pair<Integer, Collection<String>> query(SilkCarRecordQuery query) {
        final BooleanQuery.Builder builder = new BooleanQuery.Builder();
        add(builder, "workshop", query.getWorkshopId());
        add(builder, "silkCar", query.getSilkCarId());
        add(builder, "silkCar", query.getSilkCarCode());
        add(builder, "startDateTime", query.getStartDateTime(), query.getEndDateTime());
        return query(builder.build(), query.getFirst(), query.getPageSize());
    }

    public Collection<String> query(SilkCarRecordQueryByEventSourceCanHappen query) {
        final BooleanQuery.Builder builder = new BooleanQuery.Builder();
        add(builder, "workshop", query.getWorkshopId());
        final Date currentDate = new Date();
        builder.add(LongPoint.newRangeQuery("startDateTime", query.getEndDateTime().getTime(), currentDate.getTime()), MUST_NOT);
        builder.add(LongPoint.newRangeQuery("endDateTime", 0, query.getStartDateTime().getTime()), MUST_NOT);
        return query(builder.build());
    }
}
