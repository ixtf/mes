import {Grade} from './grade';
import {Operator} from './operator';

export class PackageBox {
  code: string;
  grade: Grade;
  silkCount: number;
  netWeight: number;
  creator: Operator;
  createDateTime: Operator;
}
