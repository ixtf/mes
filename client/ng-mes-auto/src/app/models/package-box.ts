import {Batch} from './batch';
import {Grade} from './grade';
import {Operator} from './operator';
import {PackageClass} from './package-class';
import {SapT001l} from './sapT001l';

export const PACKAGE_BOX_TYPE = ['AUTO', 'MANUAL', 'BIG_SILK_CAR', 'MANUAL_APPEND'];

export class PackageBox {
  id: string;
  type: 'AUTO' | 'MANUAL' | 'SMALL' | 'MANUAL_APPEND' | 'BIG_SILK_CAR';
  code: string;
  batch: Batch;
  grade: Grade;
  saleType: string;
  sapT001l: SapT001l;
  palletCode: string;
  palletType: string;
  packageType: string;
  foamType: string;
  foamNum: number;
  silkCount: number;
  netWeight: number;
  grossWeight: number;
  printCount: number;
  budat: Date;
  budatClass: PackageClass;
  creator: Operator;
  createDateTime: Operator;

  get isValidPalletCode(): boolean {
    if (!this.palletCode) {
      return false;
    }
    const palletCode = this.palletCode.toUpperCase();
    if (this.palletCode.startsWith('E')) {
      return true;
    }
    return false;
  }

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
