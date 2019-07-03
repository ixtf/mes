package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.Product;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;

import java.util.Optional;

/**
 * @author jzb 2018-06-25
 */
public interface ProductRepository {

    Optional<Product> find(String id);

    Optional<Product> find(EntityDTO product);

    PublisherBuilder<Product> list();

    Product save(Product product);

}
