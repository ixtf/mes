package com.hengyi.japp.mes.auto.search.application.internal;

import com.github.ixtf.japp.core.J;
import com.github.ixtf.persistence.lucene.Jlucene;
import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import com.hengyi.japp.mes.auto.domain.*;
import com.hengyi.japp.mes.auto.query.SilkBarcodeQuery;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.lucene.document.Document;
import org.apache.lucene.facet.FacetsConfig;
import org.apache.lucene.search.BooleanQuery;

import java.nio.file.Path;
import java.util.Collection;
import java.util.Optional;

import static com.github.ixtf.persistence.lucene.Jlucene.*;

/**
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
public class SilkBarcodeLucene extends BaseLucene<SilkBarcode> {

    @Inject
    private SilkBarcodeLucene(@Named("lucenePath") Path lucenePath, Jmongo jmongo) {
        super(lucenePath, jmongo);
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

    public Pair<Integer, Collection<String>> query(SilkBarcodeQuery query) {
        final BooleanQuery.Builder builder = new BooleanQuery.Builder();
        add(builder, "line", query.getLineId());
        add(builder, "lineMachine", query.getLineMachineId());
        add(builder, "batch", query.getBatchId());
        add(builder, "codeDate", query.getStartCodeDate(), query.getEndCodeDate());
        add(builder, "doffingNum", StringUtils.upperCase(query.getDoffingNum()));
        Optional.ofNullable(query.getDoffingNumQ())
                .map(StringUtils::upperCase)
                .filter(J::nonBlank)
                .map(it -> it + "*")
                .ifPresent(it -> addWildcard(builder, "doffingNum", it));
        return query(builder.build(), query.getFirst(), query.getPageSize());
    }
}
