import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PackageBox} from '../../../models/package-box';
import {Item as StatisticReportDayItem, XlsxItem} from '../../../models/statistic-report-day';
import {Workshop} from '../../../models/workshop';
import {ApiService} from '../../../services/api.service';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {CustomDiffAction, InitAction, QueryAction, StatisticReportDayPageState} from '../../../store/statistic-report-day-page.state';
import {StatisticReportCustomDiffDialogComponent} from './statistic-report-custom-diff-dialog/statistic-report-custom-diff-dialog.component';

@Component({
  templateUrl: './statistic-report-day-page.component.html',
  styleUrls: ['./statistic-report-day-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticReportDayPageComponent {
  readonly maxDate = new Date();
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(StatisticReportDayPageState.workshops)
  readonly workshops$: Observable<Workshop[]>;
  @Select(StatisticReportDayPageState.xlsxItems)
  readonly xlsxItems$: Observable<XlsxItem[]>;
  @Select(StatisticReportDayPageState.unDiffPackageBoxes)
  readonly unDiffPackageBoxes$: Observable<PackageBox[]>;
  @Select(StatisticReportDayPageState.customDiffItems)
  readonly customDiffItems$: Observable<StatisticReportDayItem[]>;
  @Select(StatisticReportDayPageState.showDownload)
  readonly showDownload$: Observable<boolean>;
  readonly totalItem$ = this.xlsxItems$.pipe(map(XlsxItem.total));
  readonly unDiffSilkWeightSum$ = this.unDiffPackageBoxes$.pipe(
    map(unDiffPackageBoxes => (unDiffPackageBoxes || []).reduce((acc, cur) => acc + cur.netWeight, 0)),
  );
  readonly customDiffSilkWeightSum$ = this.customDiffItems$.pipe(
    map(customDiffItems => (customDiffItems || []).reduce((acc, cur) => acc + cur.silkWeight, 0)),
  );
  readonly displayedColumns = ['line', 'product', 'spec', 'batchNo', 'AA', 'A', 'B', 'C', 'silkWeightSum', 'silkCountSum', 'aaPercent', 'aPercent'];
  readonly searchForm = this.fb.group({
    workshopId: [this.store.selectSnapshot(StatisticReportDayPageState.workshopId), Validators.required],
    date: [new Date(), Validators.required],
  });

  constructor(private store: Store,
              private api: ApiService,
              private fb: FormBuilder,
              private dialog: MatDialog) {
    this.store.dispatch(new InitAction());
  }

  @Dispatch()
  customDiff() {
    return StatisticReportCustomDiffDialogComponent.open(this.dialog, this.store.selectSnapshot(StatisticReportDayPageState.report)).pipe(
      map(items => new CustomDiffAction({items})),
    );
  }

  @Dispatch()
  query() {
    return new QueryAction(this.searchForm.value);
  }
}

@NgModule({
  declarations: [
    StatisticReportDayPageComponent,
    StatisticReportCustomDiffDialogComponent,
  ],
  entryComponents: [
    StatisticReportCustomDiffDialogComponent,
  ],
  imports: [
    NgxsModule.forFeature([StatisticReportDayPageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: StatisticReportDayPageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
