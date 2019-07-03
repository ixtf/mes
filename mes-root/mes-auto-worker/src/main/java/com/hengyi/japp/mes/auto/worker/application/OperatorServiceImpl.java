package com.hengyi.japp.mes.auto.worker.application;

import com.github.ixtf.japp.codec.Jcodec;
import com.github.ixtf.japp.core.J;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.OperatorService;
import com.hengyi.japp.mes.auto.application.command.OperatorCreateCommand;
import com.hengyi.japp.mes.auto.application.command.OperatorPermissionUpdateCommand;
import com.hengyi.japp.mes.auto.application.command.PasswordChangeCommand;
import com.hengyi.japp.mes.auto.domain.Login;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.domain.OperatorGroup;
import com.hengyi.japp.mes.auto.domain.Permission;
import com.hengyi.japp.mes.auto.repository.LoginRepository;
import com.hengyi.japp.mes.auto.repository.OperatorGroupRepository;
import com.hengyi.japp.mes.auto.repository.OperatorRepository;
import com.hengyi.japp.mes.auto.repository.PermissionRepository;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;
import java.util.Optional;
import java.util.Set;

import static java.util.stream.Collectors.toSet;


/**
 * @author jzb 2018-06-22
 */
@Slf4j
@Singleton
public class OperatorServiceImpl implements OperatorService {
    private final OperatorRepository operatorRepository;
    private final OperatorGroupRepository operatorGroupRepository;
    private final PermissionRepository permissionRepository;
    private final LoginRepository loginRepository;

    @Inject
    private OperatorServiceImpl(OperatorRepository operatorRepository, OperatorGroupRepository operatorGroupRepository, PermissionRepository permissionRepository, LoginRepository loginRepository) {
        this.operatorRepository = operatorRepository;
        this.operatorGroupRepository = operatorGroupRepository;
        this.permissionRepository = permissionRepository;
        this.loginRepository = loginRepository;
    }

    @Override
    public Operator create(Principal principal, OperatorCreateCommand command) {
        final String hrId = command.getHrId();
        final Optional<Operator> byHrId = operatorRepository.findByHrId(hrId);
        final Operator operator;
        final Login login;
        if (byHrId.isPresent()) {
            operator = byHrId.get();
            login = loginRepository.find(operator).get();
        } else {
            final String oaId = command.getOaId();
            final Optional<Operator> byOaId = operatorRepository.findByOaId(oaId);
            if (byOaId.isPresent()) {
                operator = byOaId.get();
                login = loginRepository.find(operator).get();
            } else {
                login = new Login();
                operator = new Operator();
            }
        }
        operator.setHrId(command.getHrId());
        operator.setOaId(command.getOaId());
        operator.setName(command.getName());
        final Operator result = operatorRepository.save(operator);

        login.setOperator(operator);
        login.setLoginId(operator.getHrId());
        login.setPassword(Jcodec.password(command.getPassword()));
        loginRepository.save(login);

        return result;
    }

    @Override
    public Operator update(Principal principal, String id, OperatorPermissionUpdateCommand command) {
        final Operator operator = operatorRepository.find(id).get();
        operator.setAdmin(command.isAdmin());
        operator.setRoles(command.getRoles());
        final Set<OperatorGroup> operatorGroups = J.emptyIfNull(command.getGroups())
                .parallelStream()
                .map(operatorGroupRepository::find)
                .flatMap(Optional::stream)
                .collect(toSet());
        operator.setGroups(operatorGroups);
        final Set<Permission> permissions = J.emptyIfNull(command.getGroups())
                .parallelStream()
                .map(permissionRepository::find)
                .flatMap(Optional::stream)
                .collect(toSet());
        operator.setPermissions(permissions);
        return operatorRepository.save(operator);
    }

    @Override
    public Login password(String id, PasswordChangeCommand command) {
        final Login login = loginRepository.find(id).get();
        final String password = command.getNewPassword();
        if (password.equals(command.getNewPasswordAgain())) {
            if (Jcodec.checkPassword(login.getPassword(), command.getOldPassword())) {
                login.setPassword(Jcodec.password(password));
                return loginRepository.save(login);
            }
        }
        throw new RuntimeException();
    }

}
