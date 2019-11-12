package com.hengyi.japp.mes.auto.search.application.internal;

import com.github.ixtf.persistence.lucene.BaseLucene;
import com.github.ixtf.persistence.lucene.Jlucene;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.StringField;
import org.apache.lucene.facet.FacetsConfig;

import java.util.stream.Stream;

import static java.util.stream.Collectors.toSet;

/**
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
public class DyeingPrepareLucene extends BaseLucene<DyeingPrepare> {

    @Inject
    private DyeingPrepareLucene(String luceneRootPath) {
        super(luceneRootPath);
    }

    @Override
    protected FacetsConfig facetsConfig() {
        final FacetsConfig result = new FacetsConfig();
        result.setIndexFieldName("corporation", "corporation");
        result.setIndexFieldName("workshop", "workshop");
        result.setIndexFieldName("batch", "batch");
        result.setIndexFieldName("type", "type");
        return result;
    }

    protected Document document(DyeingPrepare dyeingPrepare) {
        final Document doc = Jlucene.doc(dyeingPrepare);

        Jlucene.add(doc, "type", dyeingPrepare.getType());
        Jlucene.addFacet(doc, "type", dyeingPrepare.getType());

        Stream.concat(
                dyeingPrepare.prepareSilkCarRecords().stream().peek(silkCarRecord -> {
                    Jlucene.add(doc, "silkCarRecords", silkCarRecord.getId());
                    final SilkCar silkCar = silkCarRecord.getSilkCar();
                    Jlucene.add(doc, "silkCars", silkCar.getId());
                }).map(SilkCarRecord::getBatch),
                dyeingPrepare.prepareSilks().stream()
                        .peek(silk -> doc.add(new StringField("silks", silk.getId(), Field.Store.NO)))
                        .map(Silk::getBatch)
        ).distinct().forEach(batch -> {
            Jlucene.add(doc, "batch", batch.getId());
            final Workshop workshop = batch.getWorkshop();
            Jlucene.add(doc, "workshop", workshop.getId());
        });

        dyeingPrepare.prepareSilks().stream().map(Silk::getLineMachine).collect(toSet()).forEach(it -> {
            Jlucene.add(doc, "lineMachines", it.getId());
        });

        Jlucene.add(doc, "creator", dyeingPrepare.getCreator());
        Jlucene.add(doc, "createDateTime", dyeingPrepare.getCreateDateTime());
        Jlucene.add(doc, "submitted", dyeingPrepare.isSubmitted());
        Jlucene.add(doc, "submitter", dyeingPrepare.getSubmitter());
        Jlucene.add(doc, "submitDateTime", dyeingPrepare.getSubmitDateTime());
        return doc;
    }

}
