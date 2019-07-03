package com.hengyi.japp.mes.auto.worker.application;

import com.github.ixtf.japp.core.J;
import com.google.common.collect.Lists;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.SilkBarcodeService;
import com.hengyi.japp.mes.auto.application.command.PrintCommand;
import com.hengyi.japp.mes.auto.application.command.SilkBarcodeGenerateCommand;
import com.hengyi.japp.mes.auto.domain.*;
import com.hengyi.japp.mes.auto.domain.data.MesAutoPrinter;
import com.hengyi.japp.mes.auto.repository.LineMachineRepository;
import com.hengyi.japp.mes.auto.repository.OperatorRepository;
import com.hengyi.japp.mes.auto.repository.SilkBarcodeRepository;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import javax.validation.constraints.NotNull;
import java.security.Principal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.github.ixtf.japp.core.Constant.MAPPER;
import static java.util.stream.Collectors.toList;

/**
 * @author jzb 2018-06-22
 */
@Slf4j
@Singleton
public class SilkBarcodeServiceImpl implements SilkBarcodeService {
    private final JedisPool jedisPool;
    private final SilkBarcodeRepository silkBarcodeRepository;
    private final LineMachineRepository lineMachineRepository;
    private final OperatorRepository operatorRepository;

    @Inject
    private SilkBarcodeServiceImpl(JedisPool jedisPool, SilkBarcodeRepository silkBarcodeRepository, LineMachineRepository lineMachineRepository, OperatorRepository operatorRepository) {
        this.jedisPool = jedisPool;
        this.silkBarcodeRepository = silkBarcodeRepository;
        this.lineMachineRepository = lineMachineRepository;
        this.operatorRepository = operatorRepository;
    }

    @Override
    public Optional<SilkBarcode> findBySilkCode(String code) {
        final String s = SilkBarcodeService.silkCodeToSilkBarCode(code);
        return silkBarcodeRepository.findByCode(s);
    }

    @Override
    synchronized public SilkBarcode generate(Principal principal, SilkBarcodeGenerateCommand command) {
        final LocalDate codeLd = J.localDate(command.getCodeDate());
        final LineMachine lineMachine = lineMachineRepository.find(command.getLineMachine()).get();
        @NotNull final Batch batch = lineMachine.getProductPlan().getBatch();
        final String doffingNum = command.getDoffingNum();
        final Optional<SilkBarcode> optional = silkBarcodeRepository.find(codeLd, lineMachine, doffingNum, batch);
        if (optional.isPresent()) {
            return optional.get();
        }
        final SilkBarcode silkBarcode = new SilkBarcode();
        silkBarcode.setCodeDate(J.date(codeLd));
        silkBarcode.setDoffingNum(doffingNum);
        silkBarcode.setLineMachine(lineMachine);
        silkBarcode.setBatch(batch);
        final Long codeDoffingNum = nextCodeDoffingNum(codeLd);
        silkBarcode.setCodeDoffingNum(codeDoffingNum);
        final Operator operator = operatorRepository.find(principal);
        silkBarcode.log(operator);
        return silkBarcodeRepository.save(silkBarcode);
    }

    private Long nextCodeDoffingNum(LocalDate ld) {
        final String incrKey = SilkBarcodeService.key(J.date(ld));
        try (final Jedis jedis = jedisPool.getResource()) {
            final Long result = jedis.incr(incrKey);
            if (jedis.ttl(incrKey) == -1) {
                final long seconds = ChronoUnit.YEARS.getDuration().getSeconds();
                jedis.expire(incrKey, (int) seconds);
            }
            return result;
        }
    }

    @Override
    public void print(Principal principal, PrintCommand.SilkBarcodePrintCommand command) {
        final List<PrintCommand.Item> itemList = command.getSilkBarcodes()
                .parallelStream()
                .map(silkBarcodeRepository::find)
                .flatMap(Optional::stream)
                .flatMap(silkBarcode -> {
                    final Collection<SilkBarcode.SilkInfo> silkInfos = silkBarcode.listSilkInfo();
                    final Map<Integer, SilkBarcode.SilkInfo> map = silkInfos.stream()
                            .collect(Collectors.toMap(SilkBarcode.SilkInfo::getSpindle, Function.identity()));
                    final LineMachine lineMachine = silkBarcode.getLineMachine();
                    final List<PrintCommand.Item> items = Lists.newArrayList();
                    for (Integer spindle : lineMachine.getSpindleSeq()) {
                        final SilkBarcode.SilkInfo silkInfo = map.get(spindle);
                        final PrintCommand.Item item = new PrintCommand.Item();
                        final Date codeDate = silkInfo.getCodeDate();
                        final Line line = lineMachine.getLine();
                        final String doffingNum = silkInfo.getDoffingNum();
                        final Batch batch = silkInfo.getBatch();
                        final String batchNo = batch.getBatchNo();
                        final String spec = batch.getSpec();
                        final String code = silkInfo.getCode();
                        item.setCode(code);
                        item.setCodeDate(codeDate);
                        item.setLineName(line.getName());
                        item.setLineMachineItem(lineMachine.getItem());
                        item.setSpindle(spindle);
                        item.setDoffingNum(doffingNum);
                        item.setBatchNo(batchNo);
                        item.setBatchSpec(spec);
                        items.add(item);
                    }
                    return items.stream();
                })
                .collect(toList());
        print(command.getMesAutoPrinter(), itemList);
    }

    @SneakyThrows
    private void print(MesAutoPrinter printer, Collection<PrintCommand.Item> silks) {
        final String channel = String.join("-", "SilkBarcodePrinter", printer.getId(), printer.getName());
        final List<PrintCommand.Item> list = Lists.newArrayList(silks);
        Collections.sort(list);
        final String message = MAPPER.writeValueAsString(list);
        try (final Jedis jedis = jedisPool.getResource()) {
            jedis.publish(channel, message);
        }
    }

    @Override
    public void print(Principal principal, PrintCommand.SilkPrintCommand command) {
        print(command.getMesAutoPrinter(), command.getSilks());
    }

}
