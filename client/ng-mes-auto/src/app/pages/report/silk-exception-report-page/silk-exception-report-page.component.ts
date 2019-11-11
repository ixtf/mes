import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import * as moment from 'moment';
import {OwlDateTimeIntl} from 'ng-pick-datetime';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {SilkException} from '../../../models/silk-exception';
import {Workshop} from '../../../models/workshop';
import {MyOwlDateTimeIntl} from '../../../services/my-owl-date-time-intl';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {DisplayItem, DownloadAction, InitAction, QueryAction, SilkExceptionReportPageState} from '../../../store/silk-exception-report-page.state';

@Component({
  templateUrl: './silk-exception-report-page.component.html',
  styleUrls: ['./silk-exception-report-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkExceptionReportPageComponent {
  readonly maxDate = new Date();
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(SilkExceptionReportPageState.workshops)
  readonly workshops$: Observable<Workshop[]>;
  @Select(SilkExceptionReportPageState.silkExceptions)
  readonly silkExceptions$: Observable<SilkException[]>;
  @Select(SilkExceptionReportPageState.items)
  readonly items$: Observable<DisplayItem[]>;
  readonly displayedColumns$ = this.silkExceptions$.pipe(
    map(silkExceptions => {
      const array = silkExceptions.map(it => it.id);
      return ['product', 'line', 'batchNo', 'batchSpec'].concat(array);
    }),
  );
  readonly rangeCtrl = new FormControl();
  readonly searchForm = this.fb.group({
    workshopId: [this.store.selectSnapshot(SilkExceptionReportPageState.workshopId), Validators.required],
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
    const startMoment = moment().add(-1, 'd').startOf('d')
      .hour(this.store.selectSnapshot(SilkExceptionReportPageState.startDate_hour))
      .minute(this.store.selectSnapshot(SilkExceptionReportPageState.startDate_minute));
    const endMoment = moment().startOf('d')
      .hour(this.store.selectSnapshot(SilkExceptionReportPageState.endDate_hour))
      .minute(this.store.selectSnapshot(SilkExceptionReportPageState.endDate_minute));
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

  silkExceptionCount(row: DisplayItem, silkException: SilkException): number {
    const groupBySilkException = row.groupBySilkException.find(it => it.silkException.id === silkException.id);
    return groupBySilkException && groupBySilkException.silkCount || 0;
  }
}

@NgModule({
  declarations: [
    SilkExceptionReportPageComponent,
  ],
  imports: [
    NgxsModule.forFeature([SilkExceptionReportPageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: SilkExceptionReportPageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
  providers: [
    {provide: OwlDateTimeIntl, useClass: MyOwlDateTimeIntl, deps: [TranslateService]},
  ],
})
export class Module {
}
