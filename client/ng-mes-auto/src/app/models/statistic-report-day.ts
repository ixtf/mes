import {Batch} from './batch';
import {Grade} from './grade';
import {Line} from './line';
import {PackageBox} from './package-box';
import {Workshop} from './workshop';

export class StatisticReportDay {
  workshop: Workshop;
  date: Date;
  packageBoxCount: number;
  silkCount: number;
  silkWeight: number;
  items: Item[];
  unDiffPackageBoxes: PackageBox[];
  customDiffItems: Item[];
}

export class StatisticReportRange {
  workshop: Workshop;
  date: Date;
  packageBoxCount: number;
  silkCount: number;
  silkWeight: number;
  items: Item[];
  customDiffItems: Item[];
}

export class Item {
  bigSilkCar: boolean;
  line: Line;
  batch: Batch;
  grade: Grade;
  silkCount: number;
  silkWeight: number;
}

export class XlsxItem {
  constructor(public bigSilkCar: boolean,
              public line: Line,
              public batch: Batch,
              public displayType: 'DEFAULT' | 'LINE_SUM' | 'TOTAL' = 'DEFAULT',
              public AA = {silkCount: 0, silkWeight: 0},
              public A = {silkCount: 0, silkWeight: 0},
              public B = {silkCount: 0, silkWeight: 0},
              public C = {silkCount: 0, silkWeight: 0},
  ) {
  }

  get productName(): string {
    return this.displayType !== 'DEFAULT' ? '' : this.batch.product.name;
  }

  get batchSpec(): string {
    return this.displayType === 'LINE_SUM' ? 'LINE_SUM' : this.batch.spec;
  }

  get batchNo(): string {
    if (this.displayType !== 'DEFAULT') {
      return '';
    }
    let ret = this.batch.batchNo;
    if (this.bigSilkCar) {
      ret += '（车丝）';
    }
    return ret;
  }

  get silkCountSum(): number {
    return this.AA.silkCount + this.A.silkCount + this.B.silkCount + this.C.silkCount;
  }

  get silkWeightSum(): number {
    return this.AA.silkWeight + this.A.silkWeight + this.B.silkWeight + this.C.silkWeight;
  }

  get aaPercent(): number {
    return this.AA.silkWeight / this.silkWeightSum;
  }

  get aPercent(): number {
    return (this.AA.silkWeight + this.A.silkWeight) / this.silkWeightSum;
  }

  static total(items: XlsxItem[]): XlsxItem {
    const ret = new XlsxItem(false, null, null, 'TOTAL');
    (items || []).filter(it => it.displayType === 'LINE_SUM').forEach(item => {
      const {AA, A, B, C} = item;
      XlsxItem.collectGrade(ret.AA, AA);
      XlsxItem.collectGrade(ret.A, A);
      XlsxItem.collectGrade(ret.B, B);
      XlsxItem.collectGrade(ret.C, C);
    });
    return ret;
  }

  static collect(originalItems: Item[]): XlsxItem[] {
    const map: { [key: string]: XlsxItem } = {};
    (originalItems || []).forEach(originalItem => {
      const key = XlsxItem.key(originalItem);
      const {bigSilkCar, line, batch, grade} = originalItem;
      let xlsxItem = map[key];
      if (!xlsxItem) {
        xlsxItem = new XlsxItem(bigSilkCar, line, batch);
        map[key] = xlsxItem;
      }
      let lineSumItem = map[line.id];
      if (!lineSumItem) {
        lineSumItem = new XlsxItem(bigSilkCar, line, null, 'LINE_SUM');
        map[line.id] = lineSumItem;
      }
      if (grade.sortBy >= 100) {
        XlsxItem.collectGrade(xlsxItem.AA, originalItem);
        XlsxItem.collectGrade(lineSumItem.AA, originalItem);
      } else {
        XlsxItem.collectGrade(xlsxItem[grade.name], originalItem);
        XlsxItem.collectGrade(lineSumItem[grade.name], originalItem);
      }
    });
    return Object.values(map).sort((a, b) => {
      let i = a.line.name.localeCompare(b.line.name);
      if (i !== 0) {
        return i;
      }
      if (a.displayType !== b.displayType) {
        if (a.displayType === 'LINE_SUM') {
          return 1;
        }
        if (b.displayType === 'LINE_SUM') {
          return -1;
        }
      }
      // i = `${a.bigSilkCar}`.localeCompare(`${b.bigSilkCar}`);
      // if (i !== 0) {
      //   return i;
      // }
      i = a.batchNo.localeCompare(b.batchNo);
      return i;
    });
  }

  private static key(originalItem: Item): string {
    return [originalItem.bigSilkCar, originalItem.line.id, originalItem.batch.id].join();
  }

  private static collectGrade(data: { silkCount: number; silkWeight: number }, add: { silkCount: number; silkWeight: number }) {
    data.silkCount += add.silkCount;
    data.silkWeight += add.silkWeight;
  }
}
