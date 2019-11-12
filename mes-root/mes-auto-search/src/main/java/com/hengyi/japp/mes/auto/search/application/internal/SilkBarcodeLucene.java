package com.hengyi.japp.mes.auto.search.application.internal;

import com.github.ixtf.persistence.lucene.BaseLucene;
import com.github.ixtf.persistence.lucene.Jlucene;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.lucene.document.Document;
import org.apache.lucene.facet.FacetsConfig;

import javax.inject.Named;
import java.nio.file.Path;

import static com.github.ixtf.persistence.lucene.Jlucene.add;
import static com.github.ixtf.persistence.lucene.Jlucene.addFacet;

/**
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
public class SilkBarcodeLucene extends BaseLucene<SilkBarcode> {

    @Inject
    private SilkBarcodeLucene(@Named("luceneRootPath") Path luceneRootPath) {
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
        add(doc, "codeDate", silkBarcode.getCodeDate());
        add(doc, "doffingNum", silkBarcode.getDoffingNum());
        addFacet(doc, "doffingNum", silkBarcode.getDoffingNum());

        final LineMachine lineMachine = silkBarcode.getLineMachine();
        add(doc, "lineMachine", lineMachine);
        addFacet(doc, "lineMachine", lineMachine);

        final Line line = lineMachine.getLine();
        add(doc, "line", line);
        addFacet(doc, "line", line);

        final Workshop workshop = line.getWorkshop();
        add(doc, "workshop", workshop);
        addFacet(doc, "workshop", workshop);

        final Batch batch = silkBarcode.getBatch();
        add(doc, "batch", batch);
        addFacet(doc, "batch", batch);
        return doc;
    }
}
