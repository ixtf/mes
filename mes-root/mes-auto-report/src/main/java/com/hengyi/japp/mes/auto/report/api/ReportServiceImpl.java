package com.hengyi.japp.mes.auto.report.api;

import com.github.ixtf.japp.core.J;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.ReportService;
import com.hengyi.japp.mes.auto.application.command.ReportCommand;
import com.hengyi.japp.mes.auto.application.query.LocalDateRange;
import com.hengyi.japp.mes.auto.application.query.PackageBoxQuery;
import com.hengyi.japp.mes.auto.application.query.SilkQuery;
import com.hengyi.japp.mes.auto.application.report.*;
import com.hengyi.japp.mes.auto.domain.LineMachine;
import com.hengyi.japp.mes.auto.domain.PackageBox;
import com.hengyi.japp.mes.auto.domain.Workshop;
import com.hengyi.japp.mes.auto.dto.EntityDTO;
import com.hengyi.japp.mes.auto.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.eclipse.microprofile.reactive.streams.operators.PublisherBuilder;
import org.eclipse.microprofile.reactive.streams.operators.ReactiveStreams;

import javax.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletionStage;

import static java.util.stream.Collectors.toSet;

/**
 * @author jzb 2018-08-08
 */
@Slf4j
@Singleton
public class ReportServiceImpl implements ReportService {
    private final WorkshopRepository workshopRepository;
    private final LineRepository lineRepository;
    private final LineMachineRepository lineMachineRepository;
    private final PackageBoxRepository packageBoxRepository;
    private final SilkRepository silkRepository;

    @Inject
    private ReportServiceImpl(WorkshopRepository workshopRepository, LineRepository lineRepository, LineMachineRepository lineMachineRepository, PackageBoxRepository packageBoxRepository, SilkRepository silkRepository) {
        this.workshopRepository = workshopRepository;
        this.lineRepository = lineRepository;
        this.lineMachineRepository = lineMachineRepository;
        this.packageBoxRepository = packageBoxRepository;
        this.silkRepository = silkRepository;
    }

    @Override
    public CompletionStage<MeasureReport> measureReport(ReportCommand command) {
        final Set<@NotBlank String> budatClassIds = J.emptyIfNull(command.getPackageClasses()).stream().map(EntityDTO::getId).collect(toSet());
        final LocalDate startLd = J.localDate(command.getStartDate());
        final LocalDate endLd = J.localDate(command.getEndDate());
        final PackageBoxQuery packageBoxQuery = PackageBoxQuery.builder()
                .pageSize(Integer.MAX_VALUE)
                .workshopId(command.getWorkshop().getId())
                .budatClassIds(budatClassIds)
                .budatRange(new LocalDateRange(startLd, endLd.plusDays(1)))
                .build();
        return packageBoxRepository.query(packageBoxQuery).thenApply(it -> {
            final Collection<PackageBox> packageBoxes = it.getPackageBoxes();
            return new MeasureReport(packageBoxes);
        });
    }

    @Override
    public CompletionStage<MeasurePackageBoxReport> measurePackageBoxReport(ReportCommand command) {
        final LocalDate startLd = J.localDate(command.getStartDate());
        final LocalDate endLd = J.localDate(command.getEndDate());
        final Set<@NotBlank String> budatClassIds = J.emptyIfNull(command.getPackageClasses()).stream().map(EntityDTO::getId).collect(toSet());
        final PackageBoxQuery packageBoxQuery = PackageBoxQuery.builder()
                .pageSize(Integer.MAX_VALUE)
                .workshopId(command.getWorkshop().getId())
                .budatRange(new LocalDateRange(startLd, endLd.plusDays(1)))
                .budatClassIds(budatClassIds)
                .build();
        return packageBoxRepository.query(packageBoxQuery).thenApply(it -> {
            final Collection<PackageBox> packageBoxes = it.getPackageBoxes();
            return new MeasurePackageBoxReport(packageBoxes);
        });
    }

    @Override
    public CompletionStage<StatisticsReport> statisticsReport(String workshopId, LocalDate startLd, LocalDate endLd) {
        return null;
    }

    private CompletionStage<StatisticsReportDay> statisticsReportDay(Workshop workshop, LocalDate ld) {
        final PackageBoxQuery packageBoxQuery = PackageBoxQuery.builder()
                .pageSize(Integer.MAX_VALUE)
                .workshopId(workshop.getId())
                .budatRange(new LocalDateRange(ld, ld.plusDays(1)))
                .build();
        return packageBoxRepository.query(packageBoxQuery).thenApply(it -> {
            final Collection<PackageBox> packageBoxes = it.getPackageBoxes();
            return new StatisticsReportDay(workshop, ld, packageBoxes);
        });
    }

    @Override
    public CompletionStage<WorkshopProductPlanReport> workshopProductPlanReport(String workshopId, String lineId) {
        final PublisherBuilder<LineMachine> lineMachinePublisherBuilder;
        if (StringUtils.isNotBlank(lineId)) {
            lineMachinePublisherBuilder = lineMachineRepository.listByLineId(lineId);
        } else if (StringUtils.isNotBlank(workshopId)) {
            lineMachinePublisherBuilder = lineRepository.listByWorkshopId(workshopId)
                    .flatMap(lineMachineRepository::listBy);
        } else {
            final var run = workshopRepository.list().findFirst().run();
            lineMachinePublisherBuilder = ReactiveStreams.fromCompletionStage(run)
                    .map(Optional::get)
                    .flatMap(lineRepository::listBy)
                    .flatMap(lineMachineRepository::listBy);
        }
        return lineMachinePublisherBuilder.toList().run().thenApply(WorkshopProductPlanReport::new);
    }

    @Override
    public CompletionStage<DoffingReport> doffingReport(String workshopId, LocalDate ldStart, LocalDate ldEnd) {
        final SilkQuery silkQuery = SilkQuery.builder()
                .workshopId(workshopId)
                .ldStart(ldStart)
                .ldEnd(ldEnd)
                .pageSize(Integer.MAX_VALUE)
                .build();
        return silkRepository.query(silkQuery).thenApply(it -> new DoffingReport(it.getSilks()));
    }

    @Override
    public CompletionStage<PackageBoxReport> packageBoxReport(String workshopId, LocalDate ldStart, LocalDate ldEnd) {
        final PackageBoxQuery packageBoxQuery = PackageBoxQuery.builder()
                .workshopId(workshopId)
                .budatRange(new LocalDateRange(ldStart, ldEnd))
                .pageSize(Integer.MAX_VALUE)
                .build();
        return packageBoxRepository.query(packageBoxQuery).thenApply(it -> new PackageBoxReport(it.getPackageBoxes()));
    }

    @Override
    public CompletionStage<SilkExceptionReport> silkExceptionReport(String workshopId, LocalDate ldStart, LocalDate ldEnd) {
        final SilkQuery silkQuery = SilkQuery.builder()
                .workshopId(workshopId)
                .ldStart(ldStart)
                .ldEnd(ldEnd)
                .pageSize(Integer.MAX_VALUE)
                .build();
        return silkRepository.query(silkQuery).thenApply(it -> new SilkExceptionReport(it.getSilks()));
    }

}
