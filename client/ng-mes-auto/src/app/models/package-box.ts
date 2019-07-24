import {Batch} from './batch';
import {Grade} from './grade';
import {Operator} from './operator';

export class PackageBox {
  code: string;
  batch: Batch;
  grade: Grade;
  silkCount: number;
  netWeight: number;
  grossWeight: number;
  budat: Date;
  creator: Operator;
  createDateTime: Operator;
}
