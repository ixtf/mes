package com.hengyi.japp.mes.auto.application;

import com.hengyi.japp.mes.auto.application.command.ReportCommand;
import com.hengyi.japp.mes.auto.application.report.*;

import java.time.LocalDate;
import java.util.concurrent.CompletionStage;

/**
 * @author jzb 2018-06-22
 */
public interface ReportService {

    CompletionStage<MeasurePackageBoxReport> measurePackageBoxReport(ReportCommand command);

    CompletionStage<MeasureReport> measureReport(ReportCommand command);

    CompletionStage<StatisticsReport> statisticsReport(String workshopId, LocalDate startLd, LocalDate endLd);

    CompletionStage<WorkshopProductPlanReport> workshopProductPlanReport(String workshopId, String lineId);

    CompletionStage<DoffingReport> doffingReport(String workshopId, LocalDate ldStart, LocalDate ldEnd);

    default CompletionStage<DoffingReport> doffingReport(String workshopId, LocalDate ldStart) {
        return doffingReport(workshopId, ldStart, ldStart.plusDays(1));
    }

    CompletionStage<PackageBoxReport> packageBoxReport(String workshopId, LocalDate ldStart, LocalDate ldEnd);

    default CompletionStage<PackageBoxReport> packageBoxReport(String workshopId, LocalDate ldStart) {
        return packageBoxReport(workshopId, ldStart, ldStart.plusDays(1));
    }

    CompletionStage<SilkExceptionReport> silkExceptionReport(String workshopId, LocalDate ldStart, LocalDate ldEnd);

    default CompletionStage<SilkExceptionReport> silkExceptionReport(String workshopId, LocalDate ldStart) {
        return silkExceptionReport(workshopId, ldStart, ldStart.plusDays(1));
    }
}
