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
import {GroupByProduct, InitAction, QueryAction, StrippingReportItem, StrippingReportPageState} from '../../../store/stripping-report-page.state';
import {StrippingReportDetailDialogComponent} from './stripping-report-detail-dialog/stripping-report-detail-dialog.component';

@Component({
  templateUrl: './stripping-report-page.component.html',
  styleUrls: ['./stripping-report-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StrippingReportPageComponent {
  readonly maxDate = new Date();
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(StrippingReportPageState.workshops)
  readonly workshops$: Observable<Workshop[]>;
  @Select(StrippingReportPageState.operators)
  readonly operators$: Observable<Operator[]>;
  @Select(StrippingReportPageState.products)
  readonly products$: Observable<Product[]>;
  @Select(StrippingReportPageState.items)
  readonly items$: Observable<StrippingReportItem[]>;
  @Select(StrippingReportPageState.anonymousItem)
  readonly anonymousItem$: Observable<StrippingReportItem>;
  readonly displayedColumns$ = this.products$.pipe(map(products => {
    const productIds = (products || []).map(it => it.id);
    return ['operator'].concat(productIds).concat(['btns']);
  }));
  readonly rangeCtrl = new FormControl();
  readonly searchForm = this.fb.group({
    workshopId: [this.store.selectSnapshot(StrippingReportPageState.workshopId), Validators.required],
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
      .hour(this.store.selectSnapshot(StrippingReportPageState.startDate_hour))
      .minute(this.store.selectSnapshot(StrippingReportPageState.startDate_minute));
    const endMoment = moment().startOf('d')
      .hour(this.store.selectSnapshot(StrippingReportPageState.endDate_hour))
      .minute(this.store.selectSnapshot(StrippingReportPageState.endDate_minute));
    this.rangeCtrl.patchValue([startMoment.toDate(), endMoment.toDate()]);
  }

  @Dispatch()
  query() {
    return new QueryAction(this.searchForm.value);
  }

  detailInfo(item: StrippingReportItem, product: Product): GroupByProduct {
    return item.groupByProducts.find(it => it.product.id === product.id);
  }

  totalInfo(product: Product): GroupByProduct {
    const totalItemMap = this.store.selectSnapshot(StrippingReportPageState.totalItemMap);
    return totalItemMap[product.id];
  }

  detailDialog(item: StrippingReportItem) {
    StrippingReportDetailDialogComponent.open(this.dialog, item);
  }
}

@NgModule({
  declarations: [
    StrippingReportPageComponent,
    StrippingReportDetailDialogComponent,
  ],
  entryComponents: [
    StrippingReportDetailDialogComponent,
  ],
  imports: [
    NgxsModule.forFeature([StrippingReportPageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: StrippingReportPageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
  providers: [
    {provide: OwlDateTimeIntl, useClass: MyOwlDateTimeIntl, deps: [TranslateService]},
  ],
})
export class Module {
}
