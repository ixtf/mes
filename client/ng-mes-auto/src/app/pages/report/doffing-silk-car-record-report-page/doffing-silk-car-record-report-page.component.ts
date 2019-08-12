import {ChangeDetectionStrategy, Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import * as moment from 'moment';
import {Observable, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Workshop} from '../../../models/workshop';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {DoffingSilkCarRecordReportPageState, InfoItem, InitAction, QueryAction} from '../../../store/doffing-silk-car-record-report-page.state';

const setItem = (key: string, value: string) => {
  localStorage.setItem(`${DoffingSilkCarRecordReportPageComponent.name}.${key}`, value);
};

const getItem = (key: string) => {
  return localStorage.getItem(`${DoffingSilkCarRecordReportPageComponent.name}.${key}`);
};

@Component({
  templateUrl: './doffing-silk-car-record-report-page.component.html',
  styleUrls: ['./doffing-silk-car-record-report-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoffingSilkCarRecordReportPageComponent implements OnInit, OnDestroy {
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  readonly searchForm = this.fb.group({
    workshopId: [getItem('workshopId'), Validators.required],
    startDateTime: [null, Validators.required],
    endDateTime: [null, Validators.required],
  });
  rangeCtrl = new FormControl();
  @Select(DoffingSilkCarRecordReportPageState.workshops)
  readonly workshops$: Observable<Workshop[]>;
  @Select(DoffingSilkCarRecordReportPageState.infoItems)
  readonly infoItems$: Observable<InfoItem[]>;
  readonly displayedColumns = ['batch', 'grade', 'allDetailInfo', 'toDtyDetailInfo', 'toDtyConfirmDetailInfo', 'packageBoxDetailInfo', 'noWeightDetailInfo', 'diffDetailInfo'];
  private readonly destroy$ = new Subject();

  constructor(private store: Store,
              private fb: FormBuilder) {
    this.store.dispatch(new InitAction());
  }

  ngOnInit(): void {
    this.rangeCtrl.valueChanges.pipe(
      tap(([startDateTime, endDateTime]) => {
        this.searchForm.patchValue({startDateTime, endDateTime});
      }),
    ).subscribe();
    const startMoment = moment().startOf('d')
      .hour(parseInt(getItem('startDate_hour') || '9', 10))
      .minute(parseInt(getItem('startDate_minute') || '0', 10));
    const endMoment = moment().add(1, 'd').startOf('d')
      .hour(parseInt(getItem('endDate_hour') || '9', 10))
      .minute(parseInt(getItem('endDate_minute') || '0', 10));
    this.rangeCtrl.patchValue([startMoment, endMoment]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @Dispatch()
  query() {
    const {workshopId, startDateTime, endDateTime} = this.searchForm.value;
    setItem(`workshopId`, workshopId);
    setItem(`startDate_hour`, `${moment(startDateTime).hour()}`);
    setItem(`startDate_minute`, `${moment(startDateTime).minute()}`);
    setItem(`endDate_hour`, `${moment(endDateTime).hour()}`);
    setItem(`endDate_minute`, `${moment(endDateTime).minute()}`);
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
})
export class Module {
}
