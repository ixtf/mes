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
import {map, tap} from 'rxjs/operators';
import {Operator} from '../../../models/operator';
import {Product} from '../../../models/product';
import {Workshop} from '../../../models/workshop';
import {MyOwlDateTimeIntl} from '../../../services/my-owl-date-time-intl';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {DownloadAction, GroupByProduct, InitAction, InspectionReportItem, InspectionReportPageState, QueryAction} from '../../../store/inspection-report-page.state';
import {InspectionReportDetailDialogComponent} from './inspection-report-detail-dialog/inspection-report-detail-dialog.component';

@Component({
  templateUrl: './inspection-report-page.component.html',
  styleUrls: ['./inspection-report-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspectionReportPageComponent {
  readonly maxDate = new Date();
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(InspectionReportPageState.workshops)
  readonly workshops$: Observable<Workshop[]>;
  @Select(InspectionReportPageState.operators)
  readonly operators$: Observable<Operator[]>;
  @Select(InspectionReportPageState.products)
  readonly products$: Observable<Product[]>;
  @Select(InspectionReportPageState.items)
  readonly items$: Observable<InspectionReportItem[]>;
  @Select(InspectionReportPageState.anonymousItem)
  readonly anonymousItem$: Observable<InspectionReportItem>;
  readonly displayedColumns$ = this.products$.pipe(map(products => {
    const productIds = (products || []).map(it => it.id);
    // return ['operator'].concat(productIds).concat(['btns']);
    return ['operator'].concat(productIds);
  }));
  readonly rangeCtrl = new FormControl();
  readonly searchForm = this.fb.group({
    workshopId: [this.store.selectSnapshot(InspectionReportPageState.workshopId), Validators.required],
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
      .hour(this.store.selectSnapshot(InspectionReportPageState.startDate_hour))
      .minute(this.store.selectSnapshot(InspectionReportPageState.startDate_minute));
    const endMoment = moment().startOf('d')
      .hour(this.store.selectSnapshot(InspectionReportPageState.endDate_hour))
      .minute(this.store.selectSnapshot(InspectionReportPageState.endDate_minute));
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

  detailInfo(item: InspectionReportItem, product: Product): GroupByProduct {
    return item.groupByProducts.find(it => it.product.id === product.id);
  }

  totalInfo(product: Product): GroupByProduct {
    const totalItemMap = this.store.selectSnapshot(InspectionReportPageState.totalItemMap);
    return totalItemMap[product.id];
  }

  detailDialog(item: InspectionReportItem) {
    InspectionReportDetailDialogComponent.open(this.dialog, item);
  }
}

@NgModule({
  declarations: [
    InspectionReportPageComponent,
    InspectionReportDetailDialogComponent,
  ],
  entryComponents: [
    InspectionReportDetailDialogComponent,
  ],
  imports: [
    NgxsModule.forFeature([InspectionReportPageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: InspectionReportPageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
  providers: [
    {provide: OwlDateTimeIntl, useClass: MyOwlDateTimeIntl, deps: [TranslateService]},
  ],
})
export class Module {
}
