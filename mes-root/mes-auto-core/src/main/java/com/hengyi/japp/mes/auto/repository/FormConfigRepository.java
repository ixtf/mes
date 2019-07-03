package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.application.query.FormConfigQuery;
import com.hengyi.japp.mes.auto.domain.FormConfig;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;

import java.util.Optional;
import java.util.concurrent.CompletionStage;

/**
 * @author jzb 2018-06-24
 */
public interface FormConfigRepository {

    FormConfig save(FormConfig formConfig);

    Optional<FormConfig> find(String id);

    Optional<FormConfig> find(EntityDTO dto);

    PublisherBuilder<FormConfig> autoComplete(String q);

    CompletionStage<FormConfigQuery.Result> query(FormConfigQuery formConfigQuery);
}
