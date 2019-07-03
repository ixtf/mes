package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.application.query.ProductPlanNotifyQuery;
import com.hengyi.japp.mes.auto.domain.ProductPlanNotify;

import java.util.Optional;
import java.util.concurrent.CompletionStage;

/**
 * @author jzb 2018-06-25
 */
public interface ProductPlanNotifyRepository {

    Optional<ProductPlanNotify> find(String id);

    ProductPlanNotify save(ProductPlanNotify productPlanNotify);

    CompletionStage<ProductPlanNotifyQuery.Result> query(ProductPlanNotifyQuery productPlanNotifyQuery);
}
