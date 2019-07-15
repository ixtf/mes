import {Batch} from './batch';
import {Grade} from './grade';
import {SilkCarRecordAggregate} from './silk-car-record';

export class DoffingSilkCarRecordReportItem {
  batch: Batch;
  grade: Grade;
  silkCount: number;
  netWeight: number;
  items: SilkCarRecordAggregate[];
  noWeightItems: SilkCarRecordAggregate[];
}
