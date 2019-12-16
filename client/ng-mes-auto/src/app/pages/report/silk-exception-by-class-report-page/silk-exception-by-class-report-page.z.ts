import {SilkException} from '../../../models/silk-exception';
import {Workshop} from '../../../models/workshop';

export const PAGE_NAME = 'SilkExceptionByClassReportPage';

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

export class SilkExceptionByClassReportItem {
  silkException: SilkException;
  classCodeItems: ClassCodeItem[];
}

export class ClassCodeItem {
  classCode: string;
  silkCount: number;
}

export interface StateModel {
  workshopId?: string;
  startDateTime?: number;
  endDateTime?: number;
  workshopEntities: { [id: string]: Workshop };

  reportItems?: SilkExceptionByClassReportItem[];
  classCodes?: string[];
  displayedColumns?: string[];
}
