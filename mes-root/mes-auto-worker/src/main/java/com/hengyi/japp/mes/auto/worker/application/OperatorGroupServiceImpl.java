package com.hengyi.japp.mes.auto.worker.application;

import com.github.ixtf.japp.core.J;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.OperatorGroupService;
import com.hengyi.japp.mes.auto.application.command.OperatorGroupUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.domain.OperatorGroup;
import com.hengyi.japp.mes.auto.domain.Permission;
import com.hengyi.japp.mes.auto.repository.OperatorGroupRepository;
import com.hengyi.japp.mes.auto.repository.OperatorRepository;
import com.hengyi.japp.mes.auto.repository.PermissionRepository;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

import static java.util.stream.Collectors.toList;

/**
 * @author jzb 2018-06-22
 */
@Slf4j
@Singleton
public class OperatorGroupServiceImpl implements OperatorGroupService {
    private final OperatorRepository operatorRepository;
    private final OperatorGroupRepository operatorGroupRepository;
    private final PermissionRepository permissionRepository;

    @Inject
    private OperatorGroupServiceImpl(OperatorRepository operatorRepository, OperatorGroupRepository operatorGroupRepository, PermissionRepository permissionRepository) {
        this.operatorRepository = operatorRepository;
        this.operatorGroupRepository = operatorGroupRepository;
        this.permissionRepository = permissionRepository;
    }

    @Override
    public OperatorGroup create(Principal principal, OperatorGroupUpdateCommand command) {
        return save(principal, new OperatorGroup(), command);
    }

    private OperatorGroup save(Principal principal, OperatorGroup operatorGroup, OperatorGroupUpdateCommand command) {
        operatorGroup.setName(command.getName());
        operatorGroup.setRoles(command.getRoles());
        final List<Permission> permissions = J.emptyIfNull(command.getPermissions())
                .parallelStream()
                .map(permissionRepository::find)
                .flatMap(Optional::stream)
                .collect(toList());
        operatorGroup.setPermissions(permissions);
        final Operator operator = operatorRepository.find(principal);
        operatorGroup.log(operator);
        return operatorGroupRepository.save(operatorGroup);
    }

    @Override
    public OperatorGroup update(Principal principal, String id, OperatorGroupUpdateCommand command) {
        return save(principal, operatorGroupRepository.find(id).get(), command);
    }

}
