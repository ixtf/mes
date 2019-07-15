import {ChangeDetectionStrategy, Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable, Subject} from 'rxjs';
import {DoffingSilkCarRecordReportItem} from '../../../models/doffing-silk-car-record-report';
import {ApiService} from '../../../services/api.service';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {DoffingSilkCarRecordReportPageState, QueryAction} from '../../../store/doffing-silk-car-record-report-page.state';

@Component({
  templateUrl: './doffing-silk-car-record-report-page.component.html',
  styleUrls: ['./doffing-silk-car-record-report-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoffingSilkCarRecordReportPageComponent implements OnInit, OnDestroy {
  @Select(AppState.isAdmin)
  readonly isAdmin$: Observable<boolean>;
  readonly searchForm = this.fb.group({
    workshopId: [null, Validators.required],
    startDate: [new Date(2019, 6, 1), Validators.required],
    endDate: [new Date(), Validators.required],
  });
  readonly workshops$ = this.api.listWorkshop();
  @Select(DoffingSilkCarRecordReportPageState.items)
  readonly doffingSilkCarRecordReportItems$: Observable<DoffingSilkCarRecordReportItem[]>;
  readonly displayedColumns = ['spec', 'doffingNum', 'exception', 'creator', 'createDateTime'];
  private readonly destroy$ = new Subject();

  constructor(private store: Store,
              private fb: FormBuilder,
              private api: ApiService) {
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
