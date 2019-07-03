package com.hengyi.japp.mes.auto.repository;

import com.github.ixtf.japp.core.J;
import com.hengyi.japp.mes.auto.application.query.OperatorQuery;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;
import org.eclipse.microprofile.reactive.streams.operators.ReactiveStreams;

import java.security.Principal;
import java.util.Optional;
import java.util.concurrent.CompletionStage;

/**
 * @author jzb 2018-06-24
 */
public interface OperatorRepository {

    Optional<Operator> findByLoginId(String loginId);

    default Operator find(Principal principal) {
        return find(principal.getName()).get();
    }

    Optional<Operator> findByHrId(String hrId);

    Optional<Operator> findByOaId(String oaId);

    Optional<Operator> find(String id);

    Optional<Operator> find(EntityDTO dto);

    Operator save(Operator operator);

    CompletionStage<OperatorQuery.Result> query(OperatorQuery query);

    default PublisherBuilder<Operator> autoComplete(String q) {
        if (J.isBlank(q)) {
            return ReactiveStreams.empty();
        }
        final OperatorQuery operatorQuery = OperatorQuery.builder().pageSize(10).q(q).build();
        return ReactiveStreams.fromCompletionStage(query(operatorQuery))
                .flatMapIterable(OperatorQuery.Result::getOperators);
    }
}
