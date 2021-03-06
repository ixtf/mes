import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Grade} from '../../../models/grade';
import {XlsxItem} from '../../../models/statistic-report-day';
import {Workshop} from '../../../models/workshop';
import {ApiService} from '../../../services/api.service';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {InitAction, QueryAction, StatisticReportRangePageState} from '../../../store/statistic-report-range-page.state';
import {StatisticReportCombineDialogComponent} from './statistic-report-combine-dialog/statistic-report-combine-dialog.component';

@Component({
  templateUrl: './statistic-report-range-page.component.html',
  styleUrls: ['./statistic-report-range-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticReportRangePageComponent {
  readonly maxDate = new Date();
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(StatisticReportRangePageState.workshops)
  readonly workshops$: Observable<Workshop[]>;
  @Select(StatisticReportRangePageState.xlsxItems)
  readonly xlsxItems$: Observable<XlsxItem[]>;
  @Select(StatisticReportRangePageState.showDownload)
  readonly showDownload$: Observable<boolean>;
  readonly totalItem$ = this.xlsxItems$.pipe(map(XlsxItem.total));
  readonly grades$: Observable<Grade[]>;
  readonly displayedColumns = ['line', 'product', 'spec', 'batchNo', 'AA', 'A', 'B', 'C', 'sum', 'silkCountSum', 'aaPercent', 'aPercent'];
  readonly searchForm = this.fb.group({
    workshopId: [this.store.selectSnapshot(StatisticReportRangePageState.workshopId), Validators.required],
    startDate: [new Date(), Validators.required],
    endDate: [new Date(), Validators.required],
  });

  constructor(private store: Store,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private api: ApiService) {
    this.store.dispatch(new InitAction());
    this.grades$ = this.api.listGrade();
  }

  @Dispatch()
  query() {
    return new QueryAction(this.searchForm.value);
  }

  combine() {
    StatisticReportCombineDialogComponent.open(this.dialog);
  }
}

@NgModule({
  declarations: [
    StatisticReportRangePageComponent,
    StatisticReportCombineDialogComponent,
  ],
  entryComponents: [
    StatisticReportCombineDialogComponent,
  ],
  imports: [
    NgxsModule.forFeature([StatisticReportRangePageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: StatisticReportRangePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
