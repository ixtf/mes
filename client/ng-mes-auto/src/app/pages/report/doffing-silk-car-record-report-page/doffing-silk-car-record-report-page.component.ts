import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import * as moment from 'moment';
import {OwlDateTimeIntl} from 'ng-pick-datetime';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Workshop} from '../../../models/workshop';
import {MyOwlDateTimeIntl} from '../../../services/my-owl-date-time-intl';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {DoffingSilkCarRecordReportPageState, InfoItem, InitAction, QueryAction} from '../../../store/doffing-silk-car-record-report-page.state';

@Component({
  templateUrl: './doffing-silk-car-record-report-page.component.html',
  styleUrls: ['./doffing-silk-car-record-report-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoffingSilkCarRecordReportPageComponent {
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(DoffingSilkCarRecordReportPageState.workshops)
  readonly workshops$: Observable<Workshop[]>;
  @Select(DoffingSilkCarRecordReportPageState.infoItems)
  readonly infoItems$: Observable<InfoItem[]>;
  readonly displayedColumns = ['batch', 'grade', 'allDetailInfo', 'toDtyDetailInfo', 'toDtyConfirmDetailInfo', 'packageBoxDetailInfo', 'noWeightDetailInfo', 'diffDetailInfo'];
  readonly rangeCtrl = new FormControl();
  readonly searchForm = this.fb.group({
    workshopId: [this.store.selectSnapshot(DoffingSilkCarRecordReportPageState.workshopId), Validators.required],
    startDateTime: [null, Validators.required],
    endDateTime: [null, Validators.required],
  });

  constructor(private store: Store,
              private fb: FormBuilder) {
    this.store.dispatch(new InitAction());
    this.rangeCtrl.valueChanges.pipe(
      tap(([startDateTime, endDateTime]) => {
        this.searchForm.patchValue({startDateTime, endDateTime});
      }),
    ).subscribe();
    const startMoment = moment().startOf('d')
      .hour(this.store.selectSnapshot(DoffingSilkCarRecordReportPageState.startDate_hour))
      .minute(this.store.selectSnapshot(DoffingSilkCarRecordReportPageState.startDate_minute));
    const endMoment = moment().add(1, 'd').startOf('d')
      .hour(this.store.selectSnapshot(DoffingSilkCarRecordReportPageState.endDate_hour))
      .minute(this.store.selectSnapshot(DoffingSilkCarRecordReportPageState.endDate_minute));
    this.rangeCtrl.patchValue([startMoment.toDate(), endMoment.toDate()]);
  }

  @Dispatch()
  query() {
    return new QueryAction(this.searchForm.value);
  }
}

@NgModule({
  declarations: [
    DoffingSilkCarRecordReportPageComponent,
  ],
  entryComponents: [],
  imports: [
    NgxsModule.forFeature([DoffingSilkCarRecordReportPageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: DoffingSilkCarRecordReportPageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
  providers: [
    {provide: OwlDateTimeIntl, useClass: MyOwlDateTimeIntl, deps: [TranslateService]},
  ],
})
export class Module {
}
