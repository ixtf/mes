package com.hengyi.japp.mes.auto.search.application.internal;

import com.github.ixtf.persistence.lucene.BaseLucene;
import com.github.ixtf.persistence.lucene.Jlucene;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.LongPoint;
import org.apache.lucene.document.StringField;
import org.apache.lucene.facet.FacetField;
import org.apache.lucene.facet.FacetsConfig;

/**
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
public class SilkBarcodeLucene extends BaseLucene<SilkBarcode> {

    @Inject
    private SilkBarcodeLucene(String luceneRootPath) {
        super(luceneRootPath);
    }

    @Override
    protected FacetsConfig facetsConfig() {
        final FacetsConfig result = new FacetsConfig();
        result.setIndexFieldName("workshop", "workshop");
        result.setIndexFieldName("line", "line");
        result.setIndexFieldName("lineMachine", "lineMachine");
        result.setIndexFieldName("doffingNum", "doffingNum");
        result.setIndexFieldName("batch", "batch");
        return result;
    }

    protected Document document(SilkBarcode silkBarcode) {
        final Document doc = Jlucene.doc(silkBarcode);

        final LineMachine lineMachine = silkBarcode.getLineMachine();
        Jlucene.add(doc, "lineMachine", lineMachine.getId());
        Jlucene.addFacet(doc, "lineMachine", lineMachine.getId());

        final Line line = lineMachine.getLine();
        doc.add(new StringField("line", line.getId(), Field.Store.NO));
        doc.add(new FacetField("line", line.getId()));

        final Workshop workshop = line.getWorkshop();
        doc.add(new StringField("workshop", workshop.getId(), Field.Store.NO));
        doc.add(new FacetField("workshop", workshop.getId()));
        doc.add(new LongPoint("codeDoffingNum", silkBarcode.getCodeDoffingNum()));

        Jlucene.add(doc, "codeDate", silkBarcode.getCodeDate());

        doc.add(new StringField("doffingNum", silkBarcode.getDoffingNum(), Field.Store.NO));
        doc.add(new FacetField("doffingNum", silkBarcode.getDoffingNum()));

        final Batch batch = silkBarcode.getBatch();
        doc.add(new StringField("batch", batch.getId(), Field.Store.NO));
        doc.add(new FacetField("batch", batch.getId()));

        return doc;
    }
}
