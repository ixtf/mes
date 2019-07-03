package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.ixtf.japp.core.J;
import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.common.collect.Sets;
import com.hengyi.japp.mes.auto.domain.data.SilkCarPosition;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Collection;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author jzb 2018-07-29
 */
@Data
@ToString(callSuper = true, onlyExplicitlyIncluded = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class SilkRuntime extends SilkCarPosition {
    @ToString.Include
    @EqualsAndHashCode.Include
    private Silk silk;
    private Collection<SilkException> exceptions;
    private Collection<SilkNote> notes;
    private Grade grade;
    @JsonIgnore
    private DyeingResultCalcModel dyeingResultCalcModel = new DyeingResultCalcModel();
    private DyeingResultInfo firstDyeingResultInfo;
    private DyeingResultInfo crossDyeingResultInfo;
    private DyeingResultInfo multiDyeingResultInfo;

    public void addExceptions(Collection<SilkException> silkExceptions) {
        exceptions = Sets.newHashSet(J.emptyIfNull(exceptions));
        exceptions.addAll(J.emptyIfNull(silkExceptions));
    }

    public void removeException(Collection<SilkException> silkExceptions) {
        exceptions = Sets.newHashSet(J.emptyIfNull(exceptions));
        exceptions.removeAll(J.emptyIfNull(silkExceptions));
    }

    public void addNotes(Collection<SilkNote> silkNotes) {
        notes = Sets.newHashSet(J.emptyIfNull(notes));
        notes.addAll(J.emptyIfNull(silkNotes));
    }

    public void calcDyeing() {
        firstDyeingResultInfo = dyeingResultCalcModel.getFirstDyeingResultInfo();
        crossDyeingResultInfo = dyeingResultCalcModel.getCrossDyeingResultInfo();
    }

    @Data
    public static class DyeingResultCalcModel implements Serializable {
        private Collection<DyeingResult> dyeingResults;

        public void add(DyeingResult dyeingResult) {
            if (dyeingResults == null) {
                dyeingResults = Sets.newHashSet(dyeingResult);
            } else {
                dyeingResults.add(dyeingResult);
            }
        }

        public Grade minGrade() {
            final Set<Grade> grades = J.emptyIfNull(dyeingResults).stream()
                    .map(DyeingResult::getGrade)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            if (J.isEmpty(grades)) {
                return null;
            }
            Grade minGrade = null;
            for (Grade grade : grades) {
                if (minGrade == null) {
                    minGrade = grade;
                } else if (grade.getSortBy() < minGrade.getSortBy()) {
                    minGrade = grade;
                }
            }
            return minGrade;
        }

        public DyeingResultInfo getFirstDyeingResultInfo() {
            return J.emptyIfNull(dyeingResults).stream()
                    .filter(DyeingResult::isFirst)
                    .findFirst()
                    .map(it -> {
                        final DyeingResultInfo dyeingResultInfo = new DyeingResultInfo();
                        dyeingResultInfo.setDyeingResult(it);
                        dyeingResultInfo.setGrade(minGrade());
                        return dyeingResultInfo;
                    })
                    .orElse(null);
        }

        public DyeingResultInfo getCrossDyeingResultInfo() {
            return J.emptyIfNull(dyeingResults).stream()
                    .filter(DyeingResult::isCross)
                    .findFirst()
                    .map(it -> {
                        final DyeingResultInfo dyeingResultInfo = new DyeingResultInfo();
                        dyeingResultInfo.setDyeingResult(it);
                        dyeingResultInfo.setGrade(minGrade());
                        return dyeingResultInfo;
                    })
                    .orElse(null);
        }
    }

    @Data
    public static class DyeingResultInfo implements Serializable {
        private DyeingResult dyeingResult;
        private Grade grade;

        public Grade getGrade() {
            return grade != null ? grade : dyeingResult.getGrade();
        }
    }

    @Data
    @EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
    public static class DTO extends SilkCarPosition {
        @EqualsAndHashCode.Include
        @NotNull
        private EntityDTO silk;

        public SilkRuntime toSilkRuntime() {
            final Silk silk = Jmongo.findById(Silk.class, getSilk().getId()).get();
            return toSilkRuntime(silk);
        }

        private SilkRuntime toSilkRuntime(Silk silk) {
            final SilkRuntime silkRuntime = new SilkRuntime();
            silkRuntime.setSilk(silk);
            silkRuntime.setSideType(sideType);
            silkRuntime.setRow(row);
            silkRuntime.setCol(col);
            return silkRuntime;
        }

//        public Single<SilkRuntime> rxToSilkRuntime() {
//            final SilkRepository silkRepository = Jvertx.getProxy(SilkRepository.class);
//            return silkRepository.find(silk.getId()).map(this::toSilkRuntime);
//        }
    }
}
