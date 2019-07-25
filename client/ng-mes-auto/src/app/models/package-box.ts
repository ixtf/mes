import {Batch} from './batch';
import {Grade} from './grade';
import {Operator} from './operator';
import {PackageClass} from './package-class';

export class PackageBox {
  id: string;
  code: string;
  batch: Batch;
  grade: Grade;
  saleType: string;
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

}
