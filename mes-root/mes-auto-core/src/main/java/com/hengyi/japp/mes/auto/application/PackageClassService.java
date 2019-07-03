package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.PackageClassUpdateCommand;
import com.hengyi.japp.mes.auto.domain.PackageClass;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
public interface PackageClassService {

    PackageClass create(Principal principal, PackageClassUpdateCommand command);

    PackageClass update(Principal principal, String id, PackageClassUpdateCommand command);
}
