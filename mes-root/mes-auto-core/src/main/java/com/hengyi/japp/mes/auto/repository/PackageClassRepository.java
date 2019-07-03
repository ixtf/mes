package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.PackageClass;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;

import java.util.Optional;

/**
 * @author jzb 2018-06-24
 */
public interface PackageClassRepository {

    PackageClass save(PackageClass packageClass);

    Optional<PackageClass> find(String id);

    Optional<PackageClass> find(EntityDTO dto);

    Optional<PackageClass> findByName(String name);

    PublisherBuilder<PackageClass> list();

}
