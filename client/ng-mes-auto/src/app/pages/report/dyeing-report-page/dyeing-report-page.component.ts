import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {RouterModule} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import * as moment from 'moment';
import {OwlDateTimeIntl} from 'ng-pick-datetime';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Operator} from '../../../models/operator';
import {Workshop} from '../../../models/workshop';
import {MyOwlDateTimeIntl} from '../../../services/my-owl-date-time-intl';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {DownloadAction, DyeingReportItem, DyeingReportPageState, GroupByDyeingType, InitAction, QueryAction} from '../../../store/dyeing-report-page.state';
import {DyeingReportDetailDialogComponent} from './dyeing-report-detail-dialog/dyeing-report-detail-dialog.component';

@Component({
  templateUrl: './dyeing-report-page.component.html',
  styleUrls: ['./dyeing-report-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DyeingReportPageComponent {
  readonly maxDate = new Date();
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(DyeingReportPageState.workshops)
  readonly workshops$: Observable<Workshop[]>;
  @Select(DyeingReportPageState.operators)
  readonly operators$: Observable<Operator[]>;
  @Select(DyeingReportPageState.items)
  readonly items$: Observable<DyeingReportItem[]>;
  @Select(DyeingReportPageState.totalItem)
  readonly totalItem$: Observable<GroupByDyeingType[]>;
  readonly displayedColumns = ['operator', 'count'];
  readonly rangeCtrl = new FormControl();
  readonly searchForm = this.fb.group({
    workshopId: [this.store.selectSnapshot(DyeingReportPageState.workshopId), Validators.required],
    startDateTime: [null, Validators.required],
    endDateTime: [null, Validators.required],
  });

  constructor(private store: Store,
              private fb: FormBuilder,
              private dialog: MatDialog) {
    this.store.dispatch(new InitAction());
    this.rangeCtrl.valueChanges.pipe(
      tap(([startDateTime, endDateTime]) => {
        this.searchForm.patchValue({startDateTime, endDateTime});
      }),
    ).subscribe();
    const startMoment = moment().add(-1, 'd').startOf('d')
      .hour(this.store.selectSnapshot(DyeingReportPageState.startDate_hour))
      .minute(this.store.selectSnapshot(DyeingReportPageState.startDate_minute));
    const endMoment = moment().startOf('d')
      .hour(this.store.selectSnapshot(DyeingReportPageState.endDate_hour))
      .minute(this.store.selectSnapshot(DyeingReportPageState.endDate_minute));
    this.rangeCtrl.patchValue([startMoment.toDate(), endMoment.toDate()]);
  }

  @Dispatch()
  query() {
    return new QueryAction(this.searchForm.value);
  }

  @Dispatch()
  download() {
    return new DownloadAction();
  }

  groupByDyeingTypes(item: DyeingReportItem): GroupByDyeingType[] {
    return item.groupByDyeingTypes.sort((a, b) => a.dyeingType.localeCompare(b.dyeingType));
  }

  detailDialog(item: DyeingReportItem) {
    // DyeingReportDetailDialogComponent.open(this.dialog, item);
  }
}

@NgModule({
  declarations: [
    DyeingReportPageComponent,
    DyeingReportDetailDialogComponent,
  ],
  entryComponents: [
    DyeingReportDetailDialogComponent,
  ],
  imports: [
    NgxsModule.forFeature([DyeingReportPageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: DyeingReportPageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
  providers: [
    {provide: OwlDateTimeIntl, useClass: MyOwlDateTimeIntl, deps: [TranslateService]},
  ],
})
export class Module {
}
