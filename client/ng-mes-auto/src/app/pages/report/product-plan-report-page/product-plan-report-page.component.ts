import {ChangeDetectionStrategy, Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatSelectChange} from '@angular/material/select';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable, Subject} from 'rxjs';
import {Workshop} from '../../../models/workshop';
import {Item as ProductPlanItem} from '../../../models/workshop-product-plan-report';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../app/app.state';
import {InitAction, ProductPlanReportPageState, QueryAction} from './product-plan-report-page.state';

@Component({
  templateUrl: './product-plan-report-page.component.html',
  styleUrls: ['./product-plan-report-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPlanReportPageComponent implements OnInit, OnDestroy {
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(ProductPlanReportPageState.workshops)
  readonly workshops$: Observable<Workshop[]>;
  @Select(ProductPlanReportPageState.workshopId)
  readonly workshopId$: Observable<string>;
  readonly workshopIdCtrl = new FormControl();
  @Select(ProductPlanReportPageState.productPlanItems)
  readonly productPlanItems$: Observable<ProductPlanItem[]>;
  readonly displayedColumns = ['line', 'lineMachine', 'batch', 'tubeColor'];
  private readonly destroy$ = new Subject();

  constructor(private store: Store) {
    this.store.dispatch(new InitAction());
  }

  ngOnInit(): void {
    this.workshopId$.subscribe(it => this.workshopIdCtrl.patchValue(it, {emitEvent: false}));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @Dispatch()
  query(ev: MatSelectChange) {
    return new QueryAction({workshopId: ev.value});
  }
}

@NgModule({
  declarations: [
    ProductPlanReportPageComponent,
  ],
  entryComponents: [],
  imports: [
    NgxsModule.forFeature([ProductPlanReportPageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: ProductPlanReportPageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
