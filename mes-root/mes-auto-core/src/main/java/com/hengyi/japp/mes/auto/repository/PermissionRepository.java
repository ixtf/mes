package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.Permission;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;

import java.util.Optional;

/**
 * @author jzb 2018-06-24
 */
public interface PermissionRepository {

    Permission save(Permission permission);

    Optional<Permission> find(String id);

    Optional<Permission> find(EntityDTO dto);

    PublisherBuilder<Permission> list();

    PublisherBuilder<Permission> autoComplete(String q);
}