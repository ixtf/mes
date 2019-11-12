package com.hengyi.japp.mes.auto.search.application.internal;

import com.github.ixtf.japp.core.J;
import com.github.ixtf.persistence.lucene.BaseLucene;
import com.github.ixtf.persistence.lucene.Jlucene;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.domain.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.lucene.document.*;
import org.apache.lucene.facet.FacetField;
import org.apache.lucene.facet.FacetsConfig;

import java.util.Optional;

/**
 * @author jzb 2018-06-25
 */
@Slf4j
@Singleton
public class PackageBoxLucene extends BaseLucene<PackageBox> {

    @Inject
    private PackageBoxLucene(String luceneRootPath) {
        super(luceneRootPath);
    }

    @Override
    protected FacetsConfig facetsConfig() {
        final FacetsConfig result = new FacetsConfig();
        result.setIndexFieldName("type", "type");
        result.setIndexFieldName("workshop", "workshop");
        result.setIndexFieldName("product", "product");
        result.setIndexFieldName("batch", "batch");
        result.setIndexFieldName("grade", "grade");
        return result;
    }

    // todo 收集报表需求在决定
    protected Document document(PackageBox packageBox) {
        final Document doc = Jlucene.doc(packageBox);
        Jlucene.add(doc, "code", packageBox.getCode());

        doc.add(new StringField("type", packageBox.getType().name(), Field.Store.NO));
        doc.add(new StringField("palletCode", J.defaultString(packageBox.getPalletCode()), Field.Store.NO));
        doc.add(new DoublePoint("netWeight", packageBox.getNetWeight()));
        doc.add(new DoublePoint("grossWeight", packageBox.getGrossWeight()));

        final Batch batch = packageBox.getBatch();
        doc.add(new StringField("batch", batch.getId(), Field.Store.NO));
        doc.add(new FacetField("batch", batch.getId()));

        final Product product = batch.getProduct();
        doc.add(new StringField("product", product.getId(), Field.Store.NO));
        doc.add(new FacetField("product", product.getId()));

        final Workshop workshop = batch.getWorkshop();
        doc.add(new StringField("workshop", workshop.getId(), Field.Store.NO));
        doc.add(new FacetField("workshop", workshop.getId()));

        final Grade grade = packageBox.getGrade();
        doc.add(new StringField("grade", grade.getId(), Field.Store.NO));
        doc.add(new FacetField("grade", grade.getId()));

        J.emptyIfNull(packageBox.getSilks()).stream().map(Silk::getId)
                .forEach(it -> doc.add(new StringField("silk", it, Field.Store.NO)));
        J.emptyIfNull(packageBox.getSilkCarRecords()).stream().forEach(silkCarRecord -> {
            doc.add(new StringField("silkCarRecord", silkCarRecord.getId(), Field.Store.NO));
            doc.add(new StringField("silkCarRecord.silkCar", silkCarRecord.getSilkCar().getId(), Field.Store.NO));
        });

        Jlucene.add(doc, "printDate", packageBox.getPrintDate());
        Optional.ofNullable(packageBox.getPrintClass()).map(PackageClass::getId)
                .ifPresent(it -> doc.add(new StringField("printClass", it, Field.Store.NO)));
        doc.add(new IntPoint("printCount", packageBox.getPrintCount()));

        Jlucene.add(doc, "budat", packageBox.getBudat());
        Optional.ofNullable(packageBox.getBudatClass()).map(PackageClass::getId)
                .ifPresent(it -> doc.add(new StringField("budatClass", it, Field.Store.NO)));
        Optional.ofNullable(packageBox.getSapT001l()).map(SapT001l::getId)
                .ifPresent(it -> doc.add(new StringField("sapT001l", it, Field.Store.NO)));
        Jlucene.add(doc, "inWarehouse", packageBox.isInWarehouse());
        Jlucene.add(doc, packageBox);
        return doc;
    }

}
