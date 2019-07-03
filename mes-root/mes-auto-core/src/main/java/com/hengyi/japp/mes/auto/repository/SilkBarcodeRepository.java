package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.application.query.SilkBarcodeQuery;
import com.hengyi.japp.mes.auto.domain.Batch;
import com.hengyi.japp.mes.auto.domain.LineMachine;
import com.hengyi.japp.mes.auto.domain.SilkBarcode;
import com.hengyi.japp.mes.auto.dto.EntityDTO;

import java.time.LocalDate;
import java.util.Optional;
import java.util.concurrent.CompletionStage;

/**
 * @author jzb 2018-06-24
 */
public interface SilkBarcodeRepository {

    SilkBarcode save(SilkBarcode silkBarcode);

    Optional<SilkBarcode> find(String id);

    Optional<SilkBarcode> find(EntityDTO dto);

    Optional<SilkBarcode> findByCode(String code);

    /**
     * @param codeLd      落丝日期
     * @param lineMachine 机台
     * @param doffingNum  人工输入的落次
     * @param batch       批号
     */
    Optional<SilkBarcode> find(LocalDate codeLd, LineMachine lineMachine, String doffingNum, Batch batch);

    /**
     * @param codeLd         落丝日期
     * @param codeDoffingNum 落次流水
     * @return
     */
    Optional<SilkBarcode> find(LocalDate codeLd, long codeDoffingNum);

    CompletionStage<SilkBarcodeQuery.Result> query(SilkBarcodeQuery silkBarcodeQuery);

    void index(SilkBarcode silkBarcode);

    void delete(String id);
}
