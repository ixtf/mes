package com.hengyi.japp.mes.auto.worker.application;

import com.github.ixtf.japp.core.J;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.ProductService;
import com.hengyi.japp.mes.auto.application.command.ProductDyeingInfoUpdateCommand;
import com.hengyi.japp.mes.auto.application.command.ProductUpdateCommand;
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
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final OperatorRepository operatorRepository;
    private final FormConfigRepository formConfigRepository;
    private final SilkExceptionRepository silkExceptionRepository;
    private final SilkNoteRepository silkNoteRepository;

    @Inject
    private ProductServiceImpl(ProductRepository productRepository, OperatorRepository operatorRepository, FormConfigRepository formConfigRepository, SilkExceptionRepository silkExceptionRepository, SilkNoteRepository silkNoteRepository) {
        this.productRepository = productRepository;
        this.operatorRepository = operatorRepository;
        this.formConfigRepository = formConfigRepository;
        this.silkExceptionRepository = silkExceptionRepository;
        this.silkNoteRepository = silkNoteRepository;
    }

    @Override
    public Product create(Principal principal, ProductUpdateCommand command) {
        return save(principal, new Product(), command);
    }

    private Product save(Principal principal, Product product, ProductUpdateCommand command) {
        product.setName(command.getName());
        product.setCode(command.getCode());
        final Operator operator = operatorRepository.find(principal);
        product.log(operator);
        return productRepository.save(product);
    }

    @Override
    public Product update(Principal principal, String id, ProductUpdateCommand command) {
        return save(principal, productRepository.find(id).get(), command);
    }

    @Override
    public Product update(Principal principal, String id, ProductDyeingInfoUpdateCommand command) {
        final Product product = productRepository.find(id).get();
        final Set<SilkException> dyeingExceptions = J.emptyIfNull(command.getDyeingExceptions())
                .parallelStream()
                .map(silkExceptionRepository::find)
                .flatMap(Optional::stream)
                .collect(toSet());
        product.setDyeingExceptions(dyeingExceptions);
        final Set<SilkNote> dyeingNotes = J.emptyIfNull(command.getDyeingNotes())
                .parallelStream()
                .map(silkNoteRepository::find)
                .flatMap(Optional::stream)
                .collect(toSet());
        product.setDyeingNotes(dyeingNotes);
        final FormConfig formConfig = formConfigRepository.find(command.getDyeingFormConfig()).orElse(null);
        product.setDyeingFormConfig(formConfig);
        final Operator operator = operatorRepository.find(principal);
        product.log(operator);
        return productRepository.save(product);
    }

}
