package com.hengyi.japp.mes.auto.search.application.internal;

import com.github.ixtf.persistence.lucene.BaseLucene;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.Batch;
import com.hengyi.japp.mes.auto.domain.SilkCar;
import com.hengyi.japp.mes.auto.domain.SilkCarRecord;
import com.hengyi.japp.mes.auto.domain.Workshop;
import lombok.extern.slf4j.Slf4j;
import org.apache.lucene.document.Document;
import org.apache.lucene.facet.FacetsConfig;

import javax.inject.Named;
import java.nio.file.Path;

import static com.github.ixtf.persistence.lucene.Jlucene.*;

/**
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
public class SilkCarRecordLucene extends BaseLucene<SilkCarRecord> {

    @Inject
    private SilkCarRecordLucene(@Named("luceneRootPath") Path luceneRootPath) {
        super(luceneRootPath);
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

}
