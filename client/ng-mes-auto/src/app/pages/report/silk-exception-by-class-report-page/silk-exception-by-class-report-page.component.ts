import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {OwlDateTimeIntl} from 'ng-pick-datetime';
import {Observable} from 'rxjs';
import {Workshop} from '../../../models/workshop';
import {MyOwlDateTimeIntl} from '../../../services/my-owl-date-time-intl';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../app/app.state';
import {SilkExceptionByClassReportPageState as State} from './silk-exception-by-class-report-page.state';
import {DownloadAction, InitAction, QueryAction, SilkExceptionByClassReportItem} from './silk-exception-by-class-report-page.z';

@Component({
  templateUrl: './silk-exception-by-class-report-page.component.html',
  styleUrls: ['./silk-exception-by-class-report-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkExceptionByClassReportPageComponent {
  readonly maxDate = new Date();
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(State.workshops)
  readonly workshops$: Observable<Workshop[]>;
  @Select(State.classCodes)
  readonly classCodes$: Observable<string[]>;
  @Select(State.items)
  readonly items$: Observable<SilkExceptionByClassReportItem[]>;
  @Select(State.displayedColumns)
  readonly displayedColumns$: Observable<string[]>;
  readonly rangeCtrl = new FormControl();
  readonly searchForm = this.fb.group({
    workshopId: [this.store.selectSnapshot(State.workshopId), Validators.required],
    startDateTime: [null, Validators.required],
    endDateTime: [null, Validators.required],
  });

  constructor(private store: Store,
              private fb: FormBuilder) {
    this.store.dispatch(new InitAction());
    const startMoment = this.store.selectSnapshot(State.startDateTime);
    const endMoment = this.store.selectSnapshot(State.endDateTime);
    this.rangeCtrl.patchValue([startMoment.toDate(), endMoment.toDate()]);
    this.rangeChange([startMoment.toDate(), endMoment.toDate()]);
  }

  rangeChange([startDateTime, endDateTime]: Date[]) {
    this.searchForm.patchValue({startDateTime, endDateTime});
  }

  @Dispatch()
  query() {
    return new QueryAction(this.searchForm.value);
  }

  @Dispatch()
  download() {
    return new DownloadAction();
  }

  classCount(row: SilkExceptionByClassReportItem, classCode: string): number {
    const find = row.classCodeItems.find(it => it.classCode === classCode);
    return find && find.silkCount || 0;
  }
}

@NgModule({
  declarations: [
    SilkExceptionByClassReportPageComponent,
  ],
  imports: [
    NgxsModule.forFeature([State]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: SilkExceptionByClassReportPageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
  providers: [
    {provide: OwlDateTimeIntl, useClass: MyOwlDateTimeIntl, deps: [TranslateService]},
  ],
})
export class Module {
}
