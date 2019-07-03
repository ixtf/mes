package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.ProductProcess;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletionStage;

/**
 * @author jzb 2018-06-25
 */
public interface ProductProcessRepository {

    ProductProcess save(ProductProcess productProcess);

    Optional<ProductProcess> find(String id);

    CompletionStage<List<ProductProcess>> listByProductId(String productId);

}
