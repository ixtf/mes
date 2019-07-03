package com.hengyi.japp.mes.auto.worker.application;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.ApplicationEvents;
import com.hengyi.japp.mes.auto.application.ProductPlanNotifyService;
import com.hengyi.japp.mes.auto.application.command.ProductPlanNotifyExeCommand;
import com.hengyi.japp.mes.auto.application.command.ProductPlanNotifyUpdateCommand;
import com.hengyi.japp.mes.auto.domain.*;
import com.hengyi.japp.mes.auto.repository.*;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;
import java.util.Date;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import static java.util.stream.Collectors.toSet;

/**
 * @author jzb 2018-06-22
 */
@Slf4j
@Singleton
public class ProductPlanNotifyServiceImpl implements ProductPlanNotifyService {
    private final ApplicationEvents applicationEvents;
    private final ProductPlanNotifyRepository productPlanNotifyRepository;
    private final LineMachineRepository lineMachineRepository;
    private final BatchRepository batchRepository;
    private final LineMachineProductPlanRepository lineMachineProductPlanRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private ProductPlanNotifyServiceImpl(ApplicationEvents applicationEvents, ProductPlanNotifyRepository productPlanNotifyRepository, LineMachineRepository lineMachineRepository, BatchRepository batchRepository, LineMachineProductPlanRepository lineMachineProductPlanRepository, OperatorRepository operatorRepository) {
        this.applicationEvents = applicationEvents;
        this.productPlanNotifyRepository = productPlanNotifyRepository;
        this.lineMachineRepository = lineMachineRepository;
        this.batchRepository = batchRepository;
        this.lineMachineProductPlanRepository = lineMachineProductPlanRepository;
        this.operatorRepository = operatorRepository;
    }

    @Override
    public ProductPlanNotify create(Principal principal, ProductPlanNotifyUpdateCommand command) {
        return save(principal, new ProductPlanNotify(), command);
    }

    private ProductPlanNotify save(Principal principal, ProductPlanNotify productPlanNotify, ProductPlanNotifyUpdateCommand command) {
        productPlanNotify.setType(command.getType());
        productPlanNotify.setName(command.getName());
        productPlanNotify.setStartDate(command.getStartDate());
        final Set<LineMachine> lineMachines = command.getLineMachines()
                .parallelStream()
                .map(lineMachineRepository::find)
                .map(Optional::get)
                .collect(toSet());
        productPlanNotify.setLineMachines(lineMachines);
        final Batch batch = batchRepository.find(command.getBatch()).get();
        productPlanNotify.setBatch(batch);
        final Operator operator = operatorRepository.find(principal);
        productPlanNotify.log(operator);
        return productPlanNotifyRepository.save(productPlanNotify);
    }

    @Override
    public ProductPlanNotify update(Principal principal, String id, ProductPlanNotifyUpdateCommand command) {
        return save(principal, productPlanNotifyRepository.find(id).get(), command);
    }

    @Override
    public void exe(Principal principal, String id, ProductPlanNotifyExeCommand command) {
        final ProductPlanNotify productPlanNotify = productPlanNotifyRepository.find(id).get();
        final LineMachine lineMachine = lineMachineRepository.find(command.getLineMachine()).get();
        exe(principal, productPlanNotify, lineMachine);
    }

    private void exe(Principal principal, ProductPlanNotify productPlanNotify, LineMachine lineMachine) {
        final boolean isSameProductPlanNotify = Optional.ofNullable(lineMachine)
                .map(LineMachine::getProductPlan)
                .map(LineMachineProductPlan::getProductPlanNotify)
                .map(productPlanNotify::equals)
                .orElse(false);
        if (isSameProductPlanNotify) {
            return;
        }

        final LineMachineProductPlan prevProductPlan = lineMachine.getProductPlan();
        final LineMachineProductPlan productPlan = new LineMachineProductPlan();
        final Operator operator = operatorRepository.find(principal);
        productPlan.setStartDate(new Date());
        productPlan.setLineMachine(lineMachine);
        productPlan.setProductPlanNotify(productPlanNotify);
        productPlan.setBatch(productPlanNotify.getBatch());
        productPlan.setPrev(prevProductPlan);
        productPlan.log(operator);
        lineMachineProductPlanRepository.save(productPlan);

        lineMachine.setProductPlan(productPlan);
        lineMachineRepository.save(lineMachine);

        if (prevProductPlan != null) {
            prevProductPlan.setNext(productPlan);
            prevProductPlan.setEndDate(productPlan.getStartDate());
            lineMachineProductPlanRepository.save(prevProductPlan);
        }
        applicationEvents.fire(productPlan);
    }

    @Override
    public void unExe(Principal principal, String id, ProductPlanNotifyExeCommand command) {
        final ProductPlanNotify productPlanNotify = productPlanNotifyRepository.find(id).get();
        final LineMachine lineMachine = lineMachineRepository.find(command.getLineMachine()).get();
        unExe(principal, productPlanNotify, lineMachine);
    }

    private void unExe(Principal principal, ProductPlanNotify productPlanNotify, LineMachine lineMachine) {
        final Operator operator = operatorRepository.find(principal);
        final LineMachineProductPlan lineMachineProductPlan = lineMachine.getProductPlan();
        if (!Objects.equals(lineMachineProductPlan.getProductPlanNotify(), productPlanNotify)) {
            throw new RuntimeException();
        }
        lineMachineProductPlan.setDeleted(true);
        lineMachineProductPlan.log(operator);
        lineMachineProductPlanRepository.save(lineMachineProductPlan);
        final LineMachineProductPlan prevLineMachineProductPlan = lineMachineProductPlan.getPrev();
        lineMachine.setProductPlan(prevLineMachineProductPlan);
        lineMachine.log(operator);
        lineMachineRepository.save(lineMachine);
    }

    @Override
    public void finish(Principal principal, String id) {
        final ProductPlanNotify productPlanNotify = productPlanNotifyRepository.find(id).get();
        final Operator operator = operatorRepository.find(principal);
        productPlanNotify.setEndDate(new Date());
        productPlanNotify.log(operator);
        productPlanNotifyRepository.save(productPlanNotify);
    }

    @Override
    public void unFinish(Principal principal, String id) {
        final ProductPlanNotify productPlanNotify = productPlanNotifyRepository.find(id).get();
        final Operator operator = operatorRepository.find(principal);
        productPlanNotify.setEndDate(null);
        productPlanNotify.log(operator);
        productPlanNotifyRepository.save(productPlanNotify);
    }

}
