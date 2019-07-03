package com.hengyi.japp.mes.auto.worker.application;

import com.github.ixtf.japp.codec.Jcodec;
import com.github.ixtf.japp.core.exception.JAuthorizationException;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.AuthService;
import com.hengyi.japp.mes.auto.application.command.TokenCommand;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.domain.data.RoleType;
import com.hengyi.japp.mes.auto.repository.LoginRepository;
import com.hengyi.japp.mes.auto.repository.OperatorRepository;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.jwt.JWTOptions;
import io.vertx.reactivex.ext.auth.jwt.JWTAuth;
import lombok.extern.slf4j.Slf4j;

import javax.validation.constraints.NotNull;
import java.security.Principal;
import java.security.PrivateKey;

import static com.hengyi.japp.mes.auto.Constant.JWT_ALGORITHM;

/**
 * @author jzb 2018-06-22
 */
@Slf4j
@Singleton
public class AuthServiceImpl implements AuthService {
    private final JWTAuth jwtAuth;
    private final PrivateKey privateKey;
    private final OperatorRepository operatorRepository;
    private final LoginRepository loginRepository;

    @Inject
    private AuthServiceImpl(JWTAuth jwtAuth, PrivateKey privateKey, OperatorRepository operatorRepository, LoginRepository loginRepository) {
        this.jwtAuth = jwtAuth;
        this.privateKey = privateKey;
        this.operatorRepository = operatorRepository;
        this.loginRepository = loginRepository;
    }

    @Override
    public String token(TokenCommand command) {
        return loginRepository.findByLoginId(command.getLoginId())
                .filter(it -> Jcodec.checkPassword(it.getPassword(), command.getLoginPassword()))
                .map(login -> {
                    @NotNull final Operator operator = login.getOperator();
                    final JWTOptions options = new JWTOptions()
                            .setSubject(operator.getId())
                            .setAlgorithm(JWT_ALGORITHM)
                            .setIssuer("japp-mes-auto");
                    //                    .setExpiresInMinutes((int) TimeUnit.HOURS.toMinutes(12));
                    final JsonObject claims = new JsonObject().put("uid", operator.getId());
                    return jwtAuth.generateToken(claims, options);
                })
                .orElseThrow(RuntimeException::new);
    }

    @Override
    public String authInfo(Principal principal) {
        final Operator operator = operatorRepository.find(principal);
        final JsonObject result = new JsonObject();
        final JsonArray roles = new JsonArray();
        final JsonArray permissions = new JsonArray();
        result.put("id", operator.getId())
                .put("name", operator.getName())
                .put("admin", operator.isAdmin())
                .put("hrId", operator.getHrId())
                .put("oaId", operator.getOaId())
                .put("roles", roles)
                .put("permissions", permissions);
        fetchRoles(operator).forEach(roles::add);
        fetchPermission(operator).forEach(permissions::add);
        return result.encode();
    }

    @Override
    public void checkRole(Operator operator, RoleType roleType) throws Exception {
        if (operator.isAdmin()) {
            return;
        }
        fetchRoles(operator)
                .filter(it -> it.contains(roleType.name()))
                .findFirst()
                .orElseThrow(JAuthorizationException::new);
    }

    @Override
    public Operator checkRole(Principal principal, RoleType roleType) throws Exception {
        final Operator operator = operatorRepository.find(principal);
        checkRole(operator, roleType);
        return operator;
    }

    @Override
    public void checkPermission(Operator operator, String code) throws Exception {
        if (operator.isAdmin()) {
            return;
        }
        fetchPermission(operator)
                .filter(it -> it.equals(code))
                .findFirst()
                .orElseThrow(JAuthorizationException::new);
    }

    @Override
    public Operator checkPermission(Principal principal, String code) throws Exception {
        final Operator operator = operatorRepository.find(principal);
        checkPermission(operator, code);
        return operator;
    }

//    @Override
//    public void signEventHandleResult(RoutingContext rc, final String body) {
//        Single.fromCallable(() -> {
//            final JsonObject header = new JsonObject()
//                    .put("typ", "JWT")
//                    .put("alg", "RS512");
//            final String headerSeg = encodeToString(header);
//
//            final JsonObject payload = new JsonObject()
//                    .put("iss", "japp-mes")
//                    .put("timestamp", System.currentTimeMillis())
//                    .put("content-sha1", DigestUtils.sha1Hex(encodeToString(body)));
//            final String payloadSeg = encodeToString(payload);
//
//            return headerSeg + "." + payloadSeg + "." + sign(headerSeg + "." + payloadSeg);
//        }).subscribe(sign -> rc.response().putHeader(IF_SIGN_HEADER, sign).end(body));
//    }
//
//    private String sign(final String s) throws InvalidKeyException, SignatureException, NoSuchAlgorithmException {
//        Validate.notBlank(s);
//        final Signature sig = Signature.getInstance("SHA512withRSA");
//        sig.initSign(privateKey);
//        sig.update(s.getBytes(UTF_8));
//        return encodeToString(sig.sign());
//    }
}
