import {ChangeDetectionStrategy, Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable, Subject} from 'rxjs';
import {Workshop} from '../../../models/workshop';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {DoffingSilkCarRecordReportPageState, InfoItem, InitAction, QueryAction} from '../../../store/doffing-silk-car-record-report-page.state';

@Component({
  templateUrl: './doffing-silk-car-record-report-page.component.html',
  styleUrls: ['./doffing-silk-car-record-report-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoffingSilkCarRecordReportPageComponent implements OnInit, OnDestroy {
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  readonly searchForm = this.fb.group({
    workshopId: [this.store.selectSnapshot(DoffingSilkCarRecordReportPageState.workshopId), Validators.required],
    startDate: [new Date(), Validators.required],
    endDate: [new Date(), Validators.required],
  });
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
})
export class Module {
}
