import {Batch} from '../../../models/batch';
import {Grade} from '../../../models/grade';
import {Line} from '../../../models/line';
import {Product} from '../../../models/product';
import {SilkException} from '../../../models/silk-exception';
import {Workshop} from '../../../models/workshop';

export const PAGE_NAME = 'SilkExceptionReportPage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class QueryAction {
  static readonly type = `[${PAGE_NAME}] QueryAction`;

  constructor(public payload: { workshopId: string; startDateTime: Date; endDateTime: Date; }) {
  }
}

export class DownloadAction {
  static readonly type = `[${PAGE_NAME}] DownloadAction`;
}

export class SilkExceptionReportItem {
  line: Line;
  batch: Batch;
  silkCount: number;
  silkExceptionItems: SilkExceptionItem[];
  gradeItems: GradeItem[];
}

export class SilkExceptionItem {
  silkException: SilkException;
  silkCount = 0;
}

export class GradeItem {
  grade: Grade;
  silkCount = 0;
}

export class DisplayItem extends SilkExceptionReportItem {
  productSum: boolean;
  product: Product;

  static assign(...sources: any[]): DisplayItem {
    const result = Object.assign(new DisplayItem(), ...sources);
    return result;
  }
}

export interface StateModel {
  workshopId?: string;
  startDateTime?: number;
  endDateTime?: number;
  workshopEntities: { [id: string]: Workshop };

  reportItems?: SilkExceptionReportItem[];
  displayItems?: DisplayItem[];
  silkExceptions?: SilkException[];
  displayedColumns?: string[];
}
