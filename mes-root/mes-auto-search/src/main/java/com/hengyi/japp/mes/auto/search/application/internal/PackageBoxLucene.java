package com.hengyi.japp.mes.auto.search.application.internal;

import com.github.ixtf.persistence.lucene.BaseLucene;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.*;
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
public class PackageBoxLucene extends BaseLucene<PackageBox> {

    @Inject
    private PackageBoxLucene(@Named("luceneRootPath") Path luceneRootPath) {
        super(luceneRootPath);
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
        addFacet(doc, "type", packageBox.getType());
        add(doc, "palletCode", packageBox.getPalletCode());
        add(doc, "netWeight", packageBox.getNetWeight());
        add(doc, "grossWeight", packageBox.getGrossWeight());
        add(doc, "printDate", packageBox.getPrintDate());
        add(doc, "printClass", packageBox.getPrintClass());
        add(doc, "budat", packageBox.getBudat());
        add(doc, "budatClass", packageBox.getBudatClass());
        add(doc, "sapT001l", packageBox.getSapT001l());
        add(doc, "inWarehouse", packageBox.isInWarehouse());
        addLoggable(doc, packageBox);

        final Batch batch = packageBox.getBatch();
        add(doc, "batch", batch);
        addFacet(doc, "batch", batch);

        final Product product = batch.getProduct();
        add(doc, "product", product);
        addFacet(doc, "product", product);

        final Workshop workshop = batch.getWorkshop();
        add(doc, "workshop", workshop);
        addFacet(doc, "workshop", workshop);

        final Grade grade = packageBox.getGrade();
        add(doc, "grade", grade);
        addFacet(doc, "grade", grade);
        return doc;
    }

}
