package com.hengyi.japp.mes.auto.application;

import com.github.ixtf.japp.core.J;
import com.hengyi.japp.mes.auto.application.command.TokenCommand;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.domain.OperatorGroup;
import com.hengyi.japp.mes.auto.domain.Permission;
import com.hengyi.japp.mes.auto.domain.ProductProcess;
import com.hengyi.japp.mes.auto.domain.data.RoleType;
import io.vertx.core.json.JsonObject;
import org.apache.commons.lang3.Validate;

import java.security.Principal;
import java.util.Base64;
import java.util.Collection;
import java.util.Objects;
import java.util.stream.Stream;

import static java.nio.charset.StandardCharsets.UTF_8;

/**
 * @author jzb 2018-06-22
 */
public interface AuthService {

    default String encodeToString(final byte[] bytes) {
        Validate.notNull(bytes);
        final Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();
        return encoder.encodeToString(bytes);
    }

    default String encodeToString(final String s) {
        Validate.notBlank(s);
        final byte[] bytes = s.getBytes(UTF_8);
        return encodeToString(bytes);
    }

    default String encodeToString(final JsonObject o) {
        Validate.notNull(o);
        return encodeToString(o.encode());
    }

    default Stream<String> fetchRoles(Operator operator) {
        return Stream.concat(
                J.emptyIfNull(operator.getRoles()).stream(),
                J.emptyIfNull(operator.getGroups()).stream()
                        .map(OperatorGroup::getRoles)
                        .filter(J::nonEmpty)
                        .flatMap(Collection::stream)
        ).map(RoleType::name).distinct();
    }

    default Stream<String> fetchPermission(Operator operator) {
        return Stream.concat(
                J.emptyIfNull(operator.getPermissions()).stream(),
                J.emptyIfNull(operator.getGroups()).stream()
                        .map(OperatorGroup::getPermissions)
                        .filter(Objects::nonNull)
                        .flatMap(Collection::stream)
        ).map(Permission::getCode).distinct();
    }

    String token(TokenCommand command);

    String authInfo(Principal principal);

    void checkRole(Operator operator, RoleType roleType) throws Exception;

    Operator checkRole(Principal principal, RoleType roleType) throws Exception;

    void checkPermission(Operator operator, String code) throws Exception;

    Operator checkPermission(Principal principal, String code) throws Exception;

    default void checkProductProcessSubmit(Operator operator, String productProcessId) throws Exception {
        checkPermission(operator, "ProductProcess:" + productProcessId);
    }

    default Operator checkProductProcessSubmit(Principal principal, String productProcessId) throws Exception {
        return checkPermission(principal, "ProductProcess:" + productProcessId);
    }

    default void checkProductProcessSubmit(Operator operator, ProductProcess productProcess) throws Exception {
        checkProductProcessSubmit(operator, productProcess.getId());
    }

}
