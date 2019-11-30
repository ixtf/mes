import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {tap} from 'rxjs/operators';
import {EventSource, ProductProcessSubmitEvent} from '../../../../models/event-source';
import {Product} from '../../../../models/product';
import {SilkCarRecord} from '../../../../models/silk-car-record';
import {ApiService} from '../../../../services/api.service';
import {UtilService} from '../../../../services/util.service';
import {StrippingReportItem} from '../stripping-report-page.state';

@Component({
  templateUrl: './stripping-report-detail-dialog.component.html',
  styleUrls: ['./stripping-report-detail-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StrippingReportDetailDialogComponent {
  // readonly displayedColumns = ['code', 'doffingType', 'doffingOperator', 'doffingDateTime', 'eventSources', 'btns'];
  readonly displayedColumns = ['code', 'silkCount', 'eventSources', 'btns'];
  readonly item: StrippingReportItem;
  readonly productCtrl = new FormControl();
  readonly products: Product[];
  readonly silkCarRecordAggregatesMap: { [productId: string]: any[] } = {};

  constructor(private api: ApiService,
              private util: UtilService,
              private dialog: MatDialog,
              private dialogRef: MatDialogRef<StrippingReportDetailDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: StrippingReportItem) {
    this.item = data;
    this.products = this.item.groupByProducts.map(it => it.product).sort((a, b) => a.id.localeCompare(b.id));
    this.silkCarRecordAggregatesMap = this.item.groupByProducts.reduce((acc, cur) => {
      acc[cur.product.id] = cur.silkCarRecordAggregates;
      return acc;
    }, {});
    const initProduct = this.products[0];
    this.productCtrl.patchValue(initProduct);
    this._silkCarRecordAggregates = this.silkCarRecordAggregatesMap[initProduct.id];
    this.productCtrl.valueChanges.pipe(
      tap(it => this._silkCarRecordAggregates = this.silkCarRecordAggregatesMap[it.id]),
    ).subscribe();
  }

  private _silkCarRecordAggregates: any[];

  get silkCarRecordAggregates() {
    return this._silkCarRecordAggregates;
  }

  static open(dialog: MatDialog, data: StrippingReportItem) {
    dialog.open(StrippingReportDetailDialogComponent, {data, width: '800px'});
  }

  strippingEventSources(silkCarRecordAggregate: any): EventSource[] {
    return (silkCarRecordAggregate.eventSources || []).filter((eventSource: EventSource) => {
      if (eventSource.deleted || eventSource.type !== 'ProductProcessSubmitEvent') {
        return false;
      }
      const ev = eventSource as ProductProcessSubmitEvent;
      const productProcessId = ev.productProcess && ev.productProcess.id;
      return productProcessId === '5bffac20e189c40001863d76' || productProcessId === '5bffad09e189c40001864331';
    });
  }

  routerLinkCarRecord(silkCarRecord: SilkCarRecord) {
    return silkCarRecord.endDateTime ? '/silkCarRecord' : '/silkCarRuntime';
  }

  routerLinkCarRecordQueryParams(silkCarRecord: SilkCarRecord) {
    return silkCarRecord.endDateTime ? {id: silkCarRecord.id} : {code: silkCarRecord.silkCar.code};
  }
}
