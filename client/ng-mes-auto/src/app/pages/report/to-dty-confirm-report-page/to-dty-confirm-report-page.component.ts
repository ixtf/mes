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
import {InitAction, QueryAction, ToDtyConfirmReportItem, ToDtyConfirmReportPageState} from '../../../store/to-dty-confirm-report-page.state';
import {ToDtyConfirmReportDetailDialogComponent} from './to-dty-confirm-report-detail-dialog/to-dty-confirm-report-detail-dialog.component';

@Component({
  templateUrl: './to-dty-confirm-report-page.component.html',
  styleUrls: ['./to-dty-confirm-report-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToDtyConfirmReportPageComponent {
  readonly maxDate = new Date();
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(ToDtyConfirmReportPageState.workshops)
  readonly workshops$: Observable<Workshop[]>;
  @Select(ToDtyConfirmReportPageState.operators)
  readonly operators$: Observable<Operator[]>;
  @Select(ToDtyConfirmReportPageState.items)
  readonly items$: Observable<ToDtyConfirmReportItem[]>;
  readonly displayedColumns = ['operator', 'count'];
  readonly rangeCtrl = new FormControl();
  readonly searchForm = this.fb.group({
    workshopId: [this.store.selectSnapshot(ToDtyConfirmReportPageState.workshopId), Validators.required],
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
      .hour(this.store.selectSnapshot(ToDtyConfirmReportPageState.startDate_hour))
      .minute(this.store.selectSnapshot(ToDtyConfirmReportPageState.startDate_minute));
    const endMoment = moment().startOf('d')
      .hour(this.store.selectSnapshot(ToDtyConfirmReportPageState.endDate_hour))
      .minute(this.store.selectSnapshot(ToDtyConfirmReportPageState.endDate_minute));
    this.rangeCtrl.patchValue([startMoment.toDate(), endMoment.toDate()]);
  }

  @Dispatch()
  query() {
    return new QueryAction(this.searchForm.value);
  }

  totalInfo(): ToDtyConfirmReportItem {
    return this.store.selectSnapshot(ToDtyConfirmReportPageState.totalItemMap);
  }

  detailDialog(row: any) {

  }
}

@NgModule({
  declarations: [
    ToDtyConfirmReportPageComponent,
    ToDtyConfirmReportDetailDialogComponent,
  ],
  entryComponents: [
    ToDtyConfirmReportDetailDialogComponent,
  ],
  imports: [
    NgxsModule.forFeature([ToDtyConfirmReportPageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: ToDtyConfirmReportPageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
  providers: [
    {provide: OwlDateTimeIntl, useClass: MyOwlDateTimeIntl, deps: [TranslateService]},
  ],
})
export class Module {
}
