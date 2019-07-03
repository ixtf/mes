package com.hengyi.japp.mes.auto.worker.application;

import com.github.ixtf.japp.core.J;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.ProductProcessService;
import com.hengyi.japp.mes.auto.application.command.ProductProcessUpdateCommand;
import com.hengyi.japp.mes.auto.domain.*;
import com.hengyi.japp.mes.auto.repository.*;
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
public class ProductProcessServiceImpl implements ProductProcessService {
    private final ProductRepository productRepository;
    private final ProductProcessRepository productProcessRepository;
    private final SilkExceptionRepository silkExceptionRepository;
    private final SilkNoteRepository silkNoteRepository;
    private final FormConfigRepository formConfigRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private ProductProcessServiceImpl(ProductRepository productRepository, ProductProcessRepository productProcessRepository, SilkExceptionRepository silkExceptionRepository, SilkNoteRepository silkNoteRepository, FormConfigRepository formConfigRepository, OperatorRepository operatorRepository) {
        this.productRepository = productRepository;
        this.productProcessRepository = productProcessRepository;
        this.silkExceptionRepository = silkExceptionRepository;
        this.silkNoteRepository = silkNoteRepository;
        this.formConfigRepository = formConfigRepository;
        this.operatorRepository = operatorRepository;
    }

    @Override
    public ProductProcess create(Principal principal, ProductProcessUpdateCommand command) {
        return save(principal, new ProductProcess(), command);
    }

    private ProductProcess save(Principal principal, ProductProcess productProcess, ProductProcessUpdateCommand command) {
        productProcess.setName(command.getName());
        productProcess.setSortBy(command.getSortBy());
        productProcess.setRelateRoles(command.getRelateRoles());
        productProcess.setMustProcess(command.isMustProcess());
        final Set<SilkNote> notes = J.emptyIfNull(command.getNotes())
                .parallelStream()
                .map(silkNoteRepository::find)
                .flatMap(Optional::stream)
                .collect(toSet());
        productProcess.setNotes(notes);
        final Set<SilkException> exceptions = J.emptyIfNull(command.getExceptions())
                .parallelStream()
                .map(silkExceptionRepository::find)
                .flatMap(Optional::stream)
                .collect(toSet());
        productProcess.setExceptions(exceptions);
        final Product product = productRepository.find(command.getProduct()).get();
        productProcess.setProduct(product);
        final FormConfig formConfig = formConfigRepository.find(command.getFormConfig()).orElse(null);
        productProcess.setFormConfig(formConfig);
        final Operator operator = operatorRepository.find(principal);
        productProcess.log(operator);
        return productProcessRepository.save(productProcess);
    }

    @Override
    public ProductProcess update(Principal principal, String id, ProductProcessUpdateCommand command) {
        return save(principal, productProcessRepository.find(id).get(), command);
    }

}
