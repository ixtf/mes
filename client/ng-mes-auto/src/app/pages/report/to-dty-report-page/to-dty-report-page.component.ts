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
import {InitAction, QueryAction, ToDtyReportItem, ToDtyReportPageState} from '../../../store/to-dty-report-page.state';
import {ToDtyReportDetailDialogComponent} from './to-dty-report-detail-dialog/to-dty-report-detail-dialog.component';

@Component({
  templateUrl: './to-dty-report-page.component.html',
  styleUrls: ['./to-dty-report-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToDtyReportPageComponent {
  readonly maxDate = new Date();
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(ToDtyReportPageState.workshops)
  readonly workshops$: Observable<Workshop[]>;
  @Select(ToDtyReportPageState.operators)
  readonly operators$: Observable<Operator[]>;
  @Select(ToDtyReportPageState.items)
  readonly items$: Observable<ToDtyReportItem[]>;
  readonly displayedColumns = ['operator', 'count'];
  readonly rangeCtrl = new FormControl();
  readonly searchForm = this.fb.group({
    workshopId: [this.store.selectSnapshot(ToDtyReportPageState.workshopId), Validators.required],
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
      .hour(this.store.selectSnapshot(ToDtyReportPageState.startDate_hour))
      .minute(this.store.selectSnapshot(ToDtyReportPageState.startDate_minute));
    const endMoment = moment().startOf('d')
      .hour(this.store.selectSnapshot(ToDtyReportPageState.endDate_hour))
      .minute(this.store.selectSnapshot(ToDtyReportPageState.endDate_minute));
    this.rangeCtrl.patchValue([startMoment.toDate(), endMoment.toDate()]);
  }

  @Dispatch()
  query() {
    return new QueryAction(this.searchForm.value);
  }

  totalInfo(): ToDtyReportItem {
    return this.store.selectSnapshot(ToDtyReportPageState.totalItemMap);
  }

  detailDialog(row: any) {

  }
}

@NgModule({
  declarations: [
    ToDtyReportPageComponent,
    ToDtyReportDetailDialogComponent,
  ],
  entryComponents: [
    ToDtyReportDetailDialogComponent,
  ],
  imports: [
    NgxsModule.forFeature([ToDtyReportPageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: ToDtyReportPageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
  providers: [
    {provide: OwlDateTimeIntl, useClass: MyOwlDateTimeIntl, deps: [TranslateService]},
  ],
})
export class Module {
}
