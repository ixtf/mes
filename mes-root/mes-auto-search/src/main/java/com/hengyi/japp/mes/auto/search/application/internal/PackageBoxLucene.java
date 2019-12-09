package com.hengyi.japp.mes.auto.search.application.internal;

import com.github.ixtf.japp.core.J;
import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import com.hengyi.japp.mes.auto.domain.*;
import com.hengyi.japp.mes.auto.query.PackageBoxQuery;
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
public class PackageBoxLucene extends BaseLucene<PackageBox> {

    @Inject
    private PackageBoxLucene(@Named("lucenePath") Path lucenePath, Jmongo jmongo) {
        super(lucenePath, jmongo);
    }

    @Override
    protected FacetsConfig facetsConfig() {
        final FacetsConfig result = new FacetsConfig();
        result.setIndexFieldName("workshop", "workshop");
        result.setIndexFieldName("type", "type");
        result.setIndexFieldName("product", "product");
        result.setIndexFieldName("batch", "batch");
        result.setIndexFieldName("grade", "grade");
        return result;
    }

    // todo 收集报表需求在决定
    protected Document document(PackageBox packageBox) {
        final Document doc = doc(packageBox);
        add(doc, "code", packageBox.getCode());
        add(doc, "type", packageBox.getType());
        add(doc, "palletCode", packageBox.getPalletCode());
        add(doc, "netWeight", packageBox.getNetWeight());
        add(doc, "grossWeight", packageBox.getGrossWeight());
        add(doc, "printDate", packageBox.getPrintDate());
        add(doc, "printClass", packageBox.getPrintClass());
        add(doc, "budat", packageBox.getBudat());
        add(doc, "budatClass", packageBox.getBudatClass());
        add(doc, "sapT001l", packageBox.getSapT001l());
        add(doc, "inWarehouse", packageBox.isInWarehouse());
        add(doc, "smallBatchId", packageBox.getSmallBatchId());
        add(doc, "riambJobId", packageBox.getRiambJobId());

        final Batch batch = packageBox.getBatch();
        add(doc, "batch", batch);

        final Product product = batch.getProduct();
        add(doc, "product", product);

        final Workshop workshop = batch.getWorkshop();
        add(doc, "workshop", workshop);

        final Grade grade = packageBox.getGrade();
        add(doc, "grade", grade);

        addFacet(doc, "type", packageBox.getType());
        addFacet(doc, "batch", batch);
        addFacet(doc, "product", product);
        addFacet(doc, "workshop", workshop);
        addFacet(doc, "grade", grade);
        return doc;
    }

    public Pair<Integer, Collection<String>> query(PackageBoxQuery query) {
        final BooleanQuery.Builder builder = new BooleanQuery.Builder();
        add(builder, "inWarehouse", query.isInWarehouse());
        if (J.nonBlank(query.getPackageBoxCode())) {
            add(builder, "code", query.getPackageBoxCode());
        } else {
            add(builder, "workshop", query.getWorkshopId());
            add(builder, "type", query.getType());
            add(builder, "batch", query.getBatchId());
            add(builder, "grade", query.getGradeId());
            add(builder, "smallBatchId", query.getSmallBatchId());
            add(builder, "riambJobId", query.getRiambJobId());
            add(builder, "budat", query.getStartBudat(), query.getEndBudat());
            add(builder, "budatClass", query.getBudatClassIds());
            add(builder, "printDate", query.getStartDate(), query.getEndDate());
        }
        return query(builder.build(), query.getFirst(), query.getPageSize());
    }
}
