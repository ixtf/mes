package com.hengyi.japp.mes.auto.worker.application;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.PermissionService;
import com.hengyi.japp.mes.auto.application.command.PermissionUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.domain.Permission;
import com.hengyi.japp.mes.auto.repository.OperatorRepository;
import com.hengyi.japp.mes.auto.repository.PermissionRepository;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
@Slf4j
@Singleton
public class PermissionServiceImpl implements PermissionService {
    private final OperatorRepository operatorRepository;
    private final PermissionRepository permissionRepository;

    @Inject
    private PermissionServiceImpl(OperatorRepository operatorRepository, PermissionRepository permissionRepository) {
        this.operatorRepository = operatorRepository;
        this.permissionRepository = permissionRepository;
    }

    @Override
    public Permission create(Principal principal, PermissionUpdateCommand command) {
        return save(principal, new Permission(), command);
    }

    private Permission save(Principal principal, Permission permission, PermissionUpdateCommand command) {
        permission.setName(command.getName());
        permission.setCode(command.getCode());
        final Operator operator = operatorRepository.find(principal);
        permission.log(operator);
        return permissionRepository.save(permission);
    }

    @Override
    public Permission update(Principal principal, String id, PermissionUpdateCommand command) {
        return save(principal, permissionRepository.find(id).get(), command);
    }

}
