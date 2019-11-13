package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import com.hengyi.japp.mes.auto.domain.data.PackageBoxType;
import com.hengyi.japp.mes.auto.domain.data.SaleType;
import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.util.Collection;
import java.util.Date;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2018-06-22
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class PackageBox implements EntityLoggable {
    @ToString.Include
    @EqualsAndHashCode.Include
    @Getter
    @Setter
    @Id
    @NotBlank
    private String id;
    @ToString.Include
    @Getter
    @Setter
    @Column
    @NotNull
    private PackageBoxType type;
    @ToString.Include
    @Getter
    @Setter
    @Column
    @NotBlank
    private String code;
    @Getter
    @Setter
    @Column
    private SaleType saleType;
    /**
     * 久鼎塑托
     */
    @Getter
    @Setter
    @Column
    private String palletCode;
    /**
     * 托盘类型
     */
    @Getter
    @Setter
    @Column
    private String palletType;
    /**
     * 包装类型
     */
    @Getter
    @Setter
    @Column
    private String packageType;
    /**
     * 泡沫类型
     */
    @Getter
    @Setter
    @Column
    private String foamType;
    /**
     * 泡沫数量
     */
    @Getter
    @Setter
    @Column
    private int foamNum;
    @ToString.Include
    @Getter
    @Setter
    @Column
    @NotNull
    private Batch batch;
    @ToString.Include
    @Getter
    @Setter
    @Column
    @NotNull
    private Grade grade;
    @Getter
    @Setter
    @Column
    @Min(1)
    private int silkCount;
    @Getter
    @Setter
    @Column
    @Min(1)
    private double grossWeight;
    @Getter
    @Setter
    @Column
    @Min(1)
    private double netWeight;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private Collection<Silk> silks;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private Collection<SilkCarRecord> silkCarRecords;
    @Getter
    @Setter
    @Column
    private double tare;
    @Getter
    @Setter
    @Column
    private double pipeType;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private Collection<SilkCarRecord> silkCarRecordsSmall;
    @Getter
    @Setter
    @Column
    private String smallBatchId;
    @Getter
    @Setter
    @Column
    private int smallPacageBoxCount;
    @Getter
    @Setter
    @Column
    private int smallSilkCount;

    @JsonIgnore
    @Getter
    @Setter
    @Column(name = "command")
    private String commandJsonString;
    @Getter
    @Setter
    @Column
    private String riambJobId;

    /**
     * 唛头上的打印日期
     */
    @Getter
    @Setter
    @Column
    private Date printDate;
    @Getter
    @Setter
    @Column
    private PackageClass printClass;
    @Getter
    @Setter
    @Column
    @Min(0)
    private int printCount;
    @Getter
    @Setter
    @Column
    private String automaticPackeLine;
    /**
     * SAP 入库日期
     */
    @Getter
    @Setter
    @Column
    private Date budat;
    @Getter
    @Setter
    @Column
    private PackageClass budatClass;
    @Getter
    @Setter
    @Column
    private SapT001l sapT001l;
    @Getter
    @Setter
    @Column
    private boolean inWarehouse;

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

//    @SneakyThrows
//    @JsonGetter("command")
//    public JsonNode command() {
//        final String commandJsonString = getCommandJsonString();
//        return J.isBlank(commandJsonString) ? null : MAPPER.readTree(commandJsonString);
//    }

    @SneakyThrows(IOException.class)
    public void command(JsonNode jsonNode) {
        if (jsonNode != null) {
            setCommandJsonString(MAPPER.writeValueAsString(jsonNode));
        } else {
            setCommandJsonString(null);
        }
    }

    @JsonGetter("creator")
    public Operator _creator_() {
        return getCreator();
    }
}
