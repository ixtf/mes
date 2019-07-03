package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.domain.Login;
import com.hengyi.japp.mes.auto.domain.Operator;

import java.security.Principal;
import java.util.Optional;

/**
 * @author jzb 2018-06-24
 */
public interface LoginRepository {

    Login save(Login login);

    Optional<Login> find(String id);

    Optional<Login> findByLoginId(String loginId);

    default Optional<Login> find(Operator operator) {
        return find(operator.getId());
    }

    default Optional<Login> find(Principal principal) {
        return find(principal.getName());
    }

}
