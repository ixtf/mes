import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {RouterModule} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {OwlDateTimeIntl} from 'ng-pick-datetime';
import {Observable} from 'rxjs';
import {SilkException} from '../../../models/silk-exception';
import {Workshop} from '../../../models/workshop';
import {MyOwlDateTimeIntl} from '../../../services/my-owl-date-time-intl';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../app/app.state';
import {SilkExceptionReportNoGradeDialogComponent} from './silk-exception-report-no-grade-dialog/silk-exception-report-no-grade-dialog.component';
import {GRADE_CODES, SilkExceptionReportPageState} from './silk-exception-report-page.state';
import {DisplayItem, DownloadAction, InitAction, NoGradeInfo, QueryAction} from './silk-exception-report-page.z';

@Component({
  templateUrl: './silk-exception-report-page.component.html',
  styleUrls: ['./silk-exception-report-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkExceptionReportPageComponent {
  readonly maxDate = new Date();
  readonly gradeCodes = GRADE_CODES;
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(SilkExceptionReportPageState.workshops)
  readonly workshops$: Observable<Workshop[]>;
  @Select(SilkExceptionReportPageState.silkExceptionCols)
  readonly silkExceptionCols$: Observable<SilkException[]>;
  @Select(SilkExceptionReportPageState.items)
  readonly items$: Observable<DisplayItem[]>;
  @Select(SilkExceptionReportPageState.displayedColumns)
  readonly displayedColumns$: Observable<string[]>;
  @Select(SilkExceptionReportPageState.noGradeInfos)
  readonly noGradeInfos$: Observable<NoGradeInfo[]>;
  @Select(SilkExceptionReportPageState.noGradeSilkCount)
  readonly noGradeSilkCount$: Observable<number>;
  readonly rangeCtrl = new FormControl();
  readonly searchForm = this.fb.group({
    workshopId: [this.store.selectSnapshot(SilkExceptionReportPageState.workshopId), Validators.required],
    startDateTime: [null, Validators.required],
    endDateTime: [null, Validators.required],
  });

  constructor(private store: Store,
              private fb: FormBuilder,
              private dialog: MatDialog) {
    this.store.dispatch(new InitAction());
    const startMoment = this.store.selectSnapshot(SilkExceptionReportPageState.startDateTime);
    const endMoment = this.store.selectSnapshot(SilkExceptionReportPageState.endDateTime);
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

  silkExceptionCount(row: DisplayItem, silkException: SilkException): number {
    const find = row.silkExceptionItems.find(it => it.silkException.id === silkException.id);
    return find && find.silkCount || 0;
  }

  gradeCount(row: DisplayItem, gradeCode: string): number {
    const find = row.gradeItems.find(it => it.grade.code === gradeCode);
    return find && find.silkCount || 0;
  }

  openNoGradeInfo() {
    const noGradeInfos = this.store.selectSnapshot(SilkExceptionReportPageState.noGradeInfos);
    SilkExceptionReportNoGradeDialogComponent.open(this.dialog, {noGradeInfos});
  }
}

@NgModule({
  declarations: [
    SilkExceptionReportPageComponent,
    SilkExceptionReportNoGradeDialogComponent,
  ],
  entryComponents: [
    SilkExceptionReportNoGradeDialogComponent,
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
