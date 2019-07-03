package com.hengyi.japp.mes.auto.worker.application;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.FormConfigService;
import com.hengyi.japp.mes.auto.application.command.FormConfigUpdateCommand;
import com.hengyi.japp.mes.auto.domain.FormConfig;
import com.hengyi.japp.mes.auto.domain.Operator;
import com.hengyi.japp.mes.auto.repository.FormConfigRepository;
import com.hengyi.japp.mes.auto.repository.OperatorRepository;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;

/**
 * @author jzb 2018-06-22
 */
@Slf4j
@Singleton
public class FormConfigServiceImpl implements FormConfigService {
    private final FormConfigRepository formConfigRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private FormConfigServiceImpl(FormConfigRepository formConfigRepository, OperatorRepository operatorRepository) {
        this.formConfigRepository = formConfigRepository;
        this.operatorRepository = operatorRepository;
    }

    @Override
    public FormConfig create(Principal principal, FormConfigUpdateCommand command) {
        return save(principal, new FormConfig(), command);
    }

    @SneakyThrows
    private FormConfig save(Principal principal, FormConfig formConfig, FormConfigUpdateCommand command) {
        final Operator operator = operatorRepository.find(principal);
        formConfig.setName(command.getName());
        formConfig.formFieldsConfig(command.getFormFieldConfigs());
        formConfig.log(operator);
        return formConfigRepository.save(formConfig);
    }

    @Override
    public FormConfig update(Principal principal, String id, FormConfigUpdateCommand command) {
        return save(principal, formConfigRepository.find(id).get(), command);
    }

}
