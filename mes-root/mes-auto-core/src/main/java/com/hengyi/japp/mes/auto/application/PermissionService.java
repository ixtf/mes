package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.PermissionUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Permission;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
public interface PermissionService {

    Permission create(Principal principal, PermissionUpdateCommand command);

    Permission update(Principal principal, String id, PermissionUpdateCommand command);

}
