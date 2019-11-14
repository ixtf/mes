package com.hengyi.japp.mes.auto.search.application.internal;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.Batch;
import com.hengyi.japp.mes.auto.domain.SilkCar;
import com.hengyi.japp.mes.auto.domain.SilkCarRecord;
import com.hengyi.japp.mes.auto.domain.Workshop;
import com.hengyi.japp.mes.auto.query.SilkCarRecordQuery;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.lucene.document.Document;
import org.apache.lucene.facet.FacetsConfig;
import org.apache.lucene.search.BooleanQuery;

import javax.inject.Named;
import java.nio.file.Path;
import java.util.Collection;

import static com.github.ixtf.persistence.lucene.Jlucene.*;

/**
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
@SuppressWarnings("CdiManagedBeanInconsistencyInspection")
public class SilkCarRecordLucene extends BaseLucene<SilkCarRecord> {

    @Inject
    private SilkCarRecordLucene(@Named("luceneRootPath") Path luceneRootPath, Jmongo jmongo) {
        super(luceneRootPath, jmongo);
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

        final Batch batch = silkCarRecord.getBatch();
        add(doc, "batch", batch);
        addFacet(doc, "batch", batch);

        final Workshop workshop = batch.getWorkshop();
        add(doc, "workshop", workshop);
        addFacet(doc, "workshop", workshop);
        return doc;
    }

    public Pair<Long, Collection<String>> query(SilkCarRecordQuery query) {
        final BooleanQuery.Builder builder = new BooleanQuery.Builder();
        add(builder, "workshop", query.getWorkshopId());
        add(builder, "submitted", query.isSubmitted());
        return query(builder.build(), query.getFirst(), query.getPageSize());
    }
}
