package com.hengyi.japp.mes.auto.worker.application;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.PackageClassService;
import com.hengyi.japp.mes.auto.application.command.PackageClassUpdateCommand;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.domain.PackageClass;
import com.hengyi.japp.mes.auto.repository.OperatorRepository;
import com.hengyi.japp.mes.auto.repository.PackageClassRepository;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
@Slf4j
@Singleton
public class PackageClassServiceImpl implements PackageClassService {
    private final PackageClassRepository packageClassRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private PackageClassServiceImpl(PackageClassRepository packageClassRepository, OperatorRepository operatorRepository) {
        this.packageClassRepository = packageClassRepository;
        this.operatorRepository = operatorRepository;
    }

    @Override
    public PackageClass create(Principal principal, PackageClassUpdateCommand command) {
        return save(principal, new PackageClass(), command);
    }

    private PackageClass save(Principal principal, PackageClass packageClass, PackageClassUpdateCommand command) {
        packageClass.setName(command.getName());
        packageClass.setRiambCode(command.getRiambCode());
        packageClass.setSortBy(command.getSortBy());
        final Operator operator = operatorRepository.find(principal);
        packageClass.log(operator);
        return packageClassRepository.save(packageClass);
    }

    @Override
    public PackageClass update(Principal principal, String id, PackageClassUpdateCommand command) {
        return save(principal, packageClassRepository.find(id).get(), command);
    }
}
