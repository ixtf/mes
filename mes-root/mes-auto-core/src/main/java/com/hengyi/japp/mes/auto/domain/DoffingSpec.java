package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.ixtf.japp.core.J;
import com.google.common.collect.ComparisonChain;
import com.google.common.collect.Lists;
import com.hengyi.japp.mes.auto.domain.data.DoffingType;
import com.hengyi.japp.mes.auto.domain.data.SilkCarSideType;
import lombok.*;
import org.bson.Document;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.TreeSet;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toCollection;
import static java.util.stream.Collectors.toList;

/**
 * @author jzb 2018-07-27
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(indexes = {
        @Index(name = "_doffingType", columnList = "doffingType"),
        @Index(name = "_workshop", columnList = "workshop"),
        @Index(name = "_line", columnList = "line"),
        @Index(name = "_row", columnList = "row"),
        @Index(name = "_col", columnList = "col"),
})
public class DoffingSpec implements EntityLoggable {
    @ToString.Include
    @EqualsAndHashCode.Include
    @Getter
    @Setter
    @Id
    private String id;
    @ToString.Include
    @Getter
    @Setter
    @Column
    @NotBlank
    private String name;
    @Getter
    @Setter
    @Column
    @NotNull
    private DoffingType doffingType;
    @Getter
    @Setter
    @Column
    private Workshop workshop;
    @Getter
    @Setter
    @Column
    private Line line;
    @Getter
    @Setter
    @Column
    private int row;
    @Getter
    @Setter
    @Column
    private int col;
    @Getter
    @Setter
    @Column
    private int lineMachineCount;
    @Getter
    @Setter
    @Column
    private int spindleNum;
    @Getter
    @Setter
    @Column
    private TreeSet<CheckSpec> checkSpecs;
    @Getter
    @Setter
    @Column
    @Convert(converter = LineMachineSpecsListConverter.class)
    private List<TreeSet<LineMachineSpec>> lineMachineSpecsList;

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

    public void generateName() {
        if (J.isBlank(name)) {
            final String s = Optional.ofNullable(workshop)
                    .map(Workshop::getCode)
                    .orElse(line.getName());
            name = s + "_" + doffingType + "_" + row + "X" + col;
        }
    }

    @NoArgsConstructor
    @Data
    @Embeddable
    public static class CheckSpec implements Serializable, Comparable<CheckSpec> {
        private int orderBy;
        private List<Position> positions;

        synchronized public CheckSpec addPosition(SilkCarSideType sideType, int row, int col) {
            final Position position = new Position();
            position.setSideType(sideType);
            position.setRow(row);
            position.setCol(col);
            if (positions == null) {
                positions = Lists.newArrayList(position);
            } else {
                positions.add(position);
            }
            return this;
        }

        @Override
        public int compareTo(CheckSpec o) {
            return ComparisonChain.start()
                    .compare(orderBy, o.orderBy)
                    .result();
        }
    }

    @NoArgsConstructor
    @Data
    @Embeddable
    public static class Position implements Serializable {
        @ToString.Include
        private SilkCarSideType sideType;
        @ToString.Include
        private int row;
        @ToString.Include
        private int col;
    }

    @NoArgsConstructor
    @Data
    @Embeddable
    public static class LineMachineSpec implements Serializable, Comparable<LineMachineSpec> {
        private int orderBy;
        private List<PositionAndSpindle> items;

        public static LineMachineSpec from(Document document) {
            final LineMachineSpec lineMachineSpec = new LineMachineSpec();
            lineMachineSpec.orderBy = document.getInteger("orderBy");
            lineMachineSpec.items = document.getList("item", List.class, List.of())
                    .parallelStream()
                    .map(Document.class::cast)
                    .map(PositionAndSpindle::from)
                    .collect(toList());
            return lineMachineSpec;
        }

        synchronized public LineMachineSpec addItem(SilkCarSideType sideType, int row, int col, int spindle) {
            final PositionAndSpindle item = new PositionAndSpindle();
            item.setSideType(sideType);
            item.setRow(row);
            item.setCol(col);
            item.setSpindle(spindle);
            if (items == null) {
                items = Lists.newArrayList(item);
            } else {
                items.add(item);
            }
            return this;
        }

        @Override
        public int compareTo(LineMachineSpec o) {
            return ComparisonChain.start()
                    .compare(orderBy, o.orderBy)
                    .result();
        }

        public Document toDocument() {
            final Document ret = new Document().append("orderBy", orderBy);
            final List<Document> itemDocs = items.stream().map(PositionAndSpindle::toDocument).collect(toList());
            return ret.append("items", itemDocs);
        }
    }

    @NoArgsConstructor
    @Data
    @Embeddable
    public static class PositionAndSpindle implements Serializable {
        @ToString.Include
        private SilkCarSideType sideType;
        @ToString.Include
        private int row;
        @ToString.Include
        private int col;
        @ToString.Include
        private int spindle;

        public static PositionAndSpindle from(Document document) {
            final PositionAndSpindle positionAndSpindle = new PositionAndSpindle();
            positionAndSpindle.sideType = SilkCarSideType.valueOf(document.getString("sideType"));
            positionAndSpindle.row = document.getInteger("row");
            positionAndSpindle.col = document.getInteger("col");
            positionAndSpindle.spindle = document.getInteger("spindle");
            return positionAndSpindle;
        }

        public Document toDocument() {
            return new Document()
                    .append("sideType", sideType)
                    .append("row", row)
                    .append("col", col)
                    .append("spindle", spindle);
        }
    }

    public static class LineMachineSpecsListConverter implements AttributeConverter<List<TreeSet<LineMachineSpec>>, Document> {
        private static final String COL_NAME = "lineMachineSpecsList";

        @Override
        public Document convertToDatabaseColumn(List<TreeSet<LineMachineSpec>> attribute) {
            final List<List<Document>> lineMachineSpecsList = J.emptyIfNull(attribute).stream().map(treeSet -> treeSet.stream()
                    .map(LineMachineSpec::toDocument)
                    .collect(toList())
            ).collect(toList());
            return new Document().append(COL_NAME, lineMachineSpecsList);
        }

        @Override
        public List<TreeSet<LineMachineSpec>> convertToEntityAttribute(Document dbData) {
            return dbData.getList(COL_NAME, List.class, List.of()).stream().map(list -> {
                final Stream<Document> stream = list.stream().map(Document.class::cast);
                return stream.map(LineMachineSpec::from).collect(toCollection(TreeSet::new));
            }).collect(toList());
        }
    }

}
