package com.hengyi.japp.mes.auto.application;

import com.github.ixtf.japp.core.J;
import com.hengyi.japp.mes.auto.application.command.PrintCommand;
import com.hengyi.japp.mes.auto.application.command.SilkBarcodeGenerateCommand;
import com.hengyi.japp.mes.auto.domain.SilkBarcode;
import org.apache.commons.lang3.CharUtils;

import java.security.Principal;
import java.time.LocalDate;
import java.util.Date;
import java.util.Optional;

/**
 * @author jzb 2018-06-22
 */
public interface SilkBarcodeService {

    /**
     * 落次自增
     *
     * @param doffingDateTime
     * @return
     */
    static String key(Date doffingDateTime) {
        final LocalDate ld = J.localDate(doffingDateTime);
        return "SilkBarcodeIncr[" + ld + "]";
    }

    static String silkCodeToSilkBarCode(String silkCode) {
        final char c = silkCode.charAt(silkCode.length() - 1);
        if (CharUtils.isAsciiNumeric(c)) {
            return silkCode.substring(0, silkCode.length() - 2);
        }
        return silkCode.substring(0, silkCode.length() - 3);
    }

    Optional<SilkBarcode> findBySilkCode(String code);

    SilkBarcode generate(Principal principal, SilkBarcodeGenerateCommand command);

    void print(Principal principal, PrintCommand.SilkBarcodePrintCommand command);

    void print(Principal principal, PrintCommand.SilkPrintCommand command);

}
