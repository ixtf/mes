package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.ixtf.japp.core.J;
import com.google.common.base.Strings;
import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.Month;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.Date;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * 落次编码，数值类型全部36进制
 * 生成规则：
 * 4位日期        数值类型： 初始2018-11-11，相差天数，36进制
 * 5位落次        数值类型： 落次流水号，按天自增，16进制
 * <p>
 * 丝锭条码
 * 2位锭号        数值类型，10进制
 *
 * @author jzb 2018-08-08
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class SilkBarcode implements EntityLoggable {
    @ToString.Include
    @EqualsAndHashCode.Include
    @Getter
    @Setter
    @Id
    @NotBlank
    private String id;
    /**
     * 编码中的数字转化，36进制
     */
    public static final int RADIX = Character.MAX_RADIX;
    /**
     * 初始时间
     * 日期编码使用
     */
    public static final LocalDate INIT_LD = LocalDate.of(2018, Month.AUGUST, 1);
    @Getter
    @Setter
    @Column
    private String code;
    /**
     * 条码生成日期
     */
    @ToString.Include
    @Getter
    @Setter
    @Column
    @NotBlank
    private Date codeDate;
    /**
     * 条码生成落次，自增
     */
    @Getter
    @Setter
    @Column
    private long codeDoffingNum;
    @Getter
    @Setter
    @Column
    @NotNull
    private LineMachine lineMachine;
    /**
     * 人工输入落次
     */
    @ToString.Include
    @Getter
    @Setter
    @Column
    private String doffingNum;
    @Getter
    @Setter
    @Column
    @NotNull
    private Batch batch;
    /**
     * 是否使用，在 check 贴标 的时候更新
     */
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private Collection<Silk> silks;

    @JsonIgnore
    @Getter
    @Setter
    @Column
    @NotNull
    private Operator creator;
    @JsonIgnore
    @Getter
    @Setter
    @Column(name = "cdt")
    @NotNull
    private Date createDateTime;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private Operator modifier;
    @JsonIgnore
    @Getter
    @Setter
    @Column(name = "mdt")
    private Date modifyDateTime;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private boolean deleted;

    @JsonGetter
    public boolean batchChanged() {
        return !Objects.equals(getBatch(), getLineMachine().getProductPlan().getBatch());
    }

    public String generateCode() {
        final String dateCode = dateCode();
        final String codeDoffingNumCode = codeDoffingNumCode();
        return String.join("", dateCode, codeDoffingNumCode).toUpperCase();
    }

    public String generateSilkCode(int spindle) {
        final String spindleCode = spindleCode(spindle);
        return String.join("", getCode(), spindleCode, workshopCode()).toUpperCase();
    }

    /**
     * 4位字符
     *
     * @return 日期编码
     */
    private String dateCode() {
        final LocalDate codeLd = J.localDate(getCodeDate());
        final long between = ChronoUnit.DAYS.between(INIT_LD, codeLd);
        final String s = Long.toString(between, RADIX);
        return Strings.padStart(s, 4, '0');
    }

    /**
     * 最后位为字母，新编码     * 5位字符
     *
     * @return 落次编码
     */
    private String codeDoffingNumCode() {
        final String s = Long.toString(getCodeDoffingNum(), RADIX);
//        final String s = Long.toString(getCodeDoffingNum(), 16);
        return Strings.padStart(s, 5, '0');
    }

    /**
     * 1位字符
     * 测试最后一位为字母的扫描识别率
     *
     * @return 车间编码
     */
    private String workshopCode() {
        final LineMachine lineMachine = getLineMachine();
        final Line line = lineMachine.getLine();
        final Workshop workshop = line.getWorkshop();
        return workshop.getCode();
    }

    /**
     * 2位字符
     *
     * @return 锭位编码
     */
    private String spindleCode(int spindle) {
        final String s = Integer.toString(spindle);
        return Strings.padStart(s, 2, '0');
    }

    public Collection<SilkInfo> listSilkInfo() {
        final Date codeDate = getCodeDate();
        final String doffingNum = getDoffingNum();
        final LineMachine lineMachine = getLineMachine();
        final Batch batch = getBatch();
        return IntStream.rangeClosed(1, lineMachine.getSpindleNum()).mapToObj(spindle -> {
            final String code = generateSilkCode(spindle);
            final SilkInfo silkInfo = new SilkInfo();
            silkInfo.setCode(code);
            silkInfo.setLineMachine(lineMachine);
            silkInfo.setSpindle(spindle);
            silkInfo.setCodeDate(codeDate);
            silkInfo.setDoffingNum(doffingNum);
            silkInfo.setBatch(batch);
            return silkInfo;
        }).collect(Collectors.toList());
    }

    @Data
    public static class SilkInfo implements Serializable {
        private String code;
        private LineMachine lineMachine;
        private int spindle;
        private Date codeDate;
        private String doffingNum;
        private Batch batch;
    }

}
