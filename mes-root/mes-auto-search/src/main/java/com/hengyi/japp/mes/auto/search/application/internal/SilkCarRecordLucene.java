package com.hengyi.japp.mes.auto.search.application.internal;

import com.github.ixtf.persistence.lucene.BaseLucene;
import com.github.ixtf.persistence.lucene.Jlucene;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.Batch;
import com.hengyi.japp.mes.auto.domain.SilkCar;
import com.hengyi.japp.mes.auto.domain.SilkCarRecord;
import com.hengyi.japp.mes.auto.domain.Workshop;
import lombok.extern.slf4j.Slf4j;
import org.apache.lucene.document.Document;
import org.apache.lucene.facet.FacetsConfig;

/**
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
public class SilkCarRecordLucene extends BaseLucene<SilkCarRecord> {

    @Inject
    private SilkCarRecordLucene(String luceneRootPath) {
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
        final Document doc = Jlucene.doc(silkCarRecord);

        Jlucene.add(doc, "doffingType", silkCarRecord.getDoffingType());
        Jlucene.addFacet(doc, "doffingType", silkCarRecord.getDoffingType());

        final SilkCar silkCar = silkCarRecord.getSilkCar();
        Jlucene.add(doc, "silkCar", silkCar.getId());

        final Batch batch = silkCarRecord.getBatch();
        Jlucene.add(doc, "batch", batch.getId());
        Jlucene.addFacet(doc, "batch", batch.getId());

        final Workshop workshop = batch.getWorkshop();
        Jlucene.add(doc, "workshop", workshop.getId());
        Jlucene.addFacet(doc, "workshop", workshop.getId());

        Jlucene.add(doc, "startDateTime", silkCarRecord.getStartDateTime());
        Jlucene.add(doc, "endDateTime", silkCarRecord.getEndDateTime());
        return doc;
    }

}
