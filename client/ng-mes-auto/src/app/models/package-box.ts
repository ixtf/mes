import {Batch} from './batch';
import {Grade} from './grade';
import {Operator} from './operator';
import {PackageClass} from './package-class';
import {SapT001l} from './sapT001l';
import {Workshop} from './workshop';

export const PACKAGE_BOX_TYPE = ['AUTO', 'MANUAL', 'MANUAL_APPEND', 'BIG_SILK_CAR', 'SMALL'];

export class PackageBox {
  id: string;
  type: 'AUTO' | 'MANUAL' | 'MANUAL_APPEND' | 'BIG_SILK_CAR' | 'SMALL';
  code: string;
  batch: Batch;
  grade: Grade;
  saleType: 'DOMESTIC' | 'FOREIGN';
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

  static isValidPalletCode(palletCode: string): boolean {
    if (!palletCode) {
      return false;
    }
    const check = palletCode.toUpperCase();
    if (check.startsWith('E') || check.startsWith('F')) {
      return true;
    }
    return false;
  }

  static weightFormula(options: { batch: Batch, grade: Grade, silkCount: number, grossWeight?: number, tare?: number }): { netWeight: string; grossWeight?: string } {
    const {batch, grade, silkCount, grossWeight, tare} = options;
    if (batch && grade && silkCount) {
      if (grade.sortBy >= 100) {
        return {
          netWeight: `${silkCount} * ${batch.silkWeight}`,
          grossWeight: `${silkCount} * ${batch.silkWeight} + ${silkCount} * ${batch.tubeWeight}`,
        };
      } else if (grossWeight) {
        let netWeightFormula = `${grossWeight} - ${silkCount} * ${batch.tubeWeight}`;
        if (tare) {
          netWeightFormula = `${netWeightFormula} - ${tare}`;
        }
        if (grade.sortBy >= 80) {
          return {
            netWeight: `${netWeightFormula} - 0.5`,
          };
        } else {
          return {
            netWeight: `${netWeightFormula}`,
          };
        }
      }
    }
    return null;
  }

  static sapT001ls(options: { saleType: string; workshop: Workshop; palletCode?: string; }): SapT001l[] {
    const {saleType, workshop: {sapT001ls, sapT001lsForeign, sapT001lsPallet}, palletCode} = options;
    if (PackageBox.isValidPalletCode(palletCode)) {
      return sapT001lsPallet;
    }
    switch (saleType) {
      case  'DOMESTIC': {
        return sapT001ls;
      }
      case 'FOREIGN': {
        return sapT001lsForeign;
      }
    }
    return [];
  }
}
