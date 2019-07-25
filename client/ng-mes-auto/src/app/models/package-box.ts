import {Batch} from './batch';
import {Grade} from './grade';
import {Operator} from './operator';

export class PackageBox {
  id: string;
  code: string;
  batch: Batch;
  grade: Grade;
  silkCount: number;
  netWeight: number;
  grossWeight: number;
  budat: Date;
  creator: Operator;
  createDateTime: Operator;

  static assign(...sources: any[]): PackageBox {
    const result = Object.assign(new PackageBox(), ...sources);
    return result;
  }

  static toEntities(os: PackageBox[], entities?: { [id: string]: PackageBox }): { [id: string]: PackageBox } {
    return (os || []).reduce((acc, cur) => {
      acc[cur.id] = PackageBox.assign(cur);
      return acc;
    }, {...(entities || {})});
  }
}
