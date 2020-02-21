import {Injectable} from '@angular/core';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {saveAs} from 'file-saver';
import * as moment from 'moment';
import {tap} from 'rxjs/operators';
import {PackageBox} from '../../../models/package-box';
import {Item as StatisticReportDayItem, StatisticReportDay, XlsxItem} from '../../../models/statistic-report-day';
import {Workshop} from '../../../models/workshop';
import {ApiService} from '../../../services/api.service';
import {CODE_COMPARE} from '../../../services/util.service';

const PAGE_NAME = 'StatisticReportDayPage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class QueryAction {
  static readonly type = `[${PAGE_NAME}] QueryAction`;

  constructor(public payload: { workshopId: string; date: Date; }) {
  }
}

export class CustomDiffAction {
  static readonly type = `[${PAGE_NAME}] CustomDiffAction`;

  constructor(public payload: { items: StatisticReportDayItem[]; }) {
  }
}

export class DownloadAction {
  static readonly type = `[${PAGE_NAME}] DownloadAction`;
}

interface StateModel {
  workshopId?: string;
  date?: number;
  workshopEntities: { [id: string]: Workshop };
  report?: StatisticReportDay;
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    workshopEntities: {},
  },
})
@Injectable()
export class StatisticReportDayPageState {
  constructor(private api: ApiService) {
  }

  static storageIds(): string[] {
    return [`${PAGE_NAME}.workshopId`];
  }

  @Selector()
  @ImmutableSelector()
  static workshopId(state: StateModel): string {
    return state.workshopId;
  }

  @Selector()
  @ImmutableSelector()
  static workshops(state: StateModel): Workshop[] {
    return Object.values(state.workshopEntities).sort(CODE_COMPARE);
  }

  @Selector()
  @ImmutableSelector()
  static report(state: StateModel): StatisticReportDay {
    return state.report;
  }

  @Selector()
  @ImmutableSelector()
  static unDiffPackageBoxes(state: StateModel): PackageBox[] {
    return state.report && state.report.unDiffPackageBoxes || [];
  }

  @Selector()
  @ImmutableSelector()
  static customDiffItems(state: StateModel): StatisticReportDayItem[] {
    return state.report && state.report.customDiffItems || [];
  }

  @Selector()
  @ImmutableSelector()
  static xlsxItems(state: StateModel): XlsxItem[] {
    const items = state.report && state.report.items;
    return XlsxItem.collect(items);
  }

  @Selector()
  @ImmutableSelector()
  static showDownload(state: StateModel): boolean {
    if (!state.report) {
      return false;
    }
    if (!state.report.unDiffPackageBoxes) {
      return true;
    }
    if (state.report.unDiffPackageBoxes.length < 1) {
      return true;
    }
    const count1 = state.report.unDiffPackageBoxes.reduce((acc, cur) => acc + cur.silkCount, 0);
    const count2 = state.report.customDiffItems.reduce((acc, cur) => acc + cur.silkCount, 0);
    return count1 === count2;
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<StateModel>) {
    return this.api.listWorkshop().pipe(
      tap(workshops => setState((state: StateModel) => {
        state.workshopEntities = Workshop.toEntities(workshops);
        return state;
      })),
    );
  }

  @Action(CustomDiffAction)
  @ImmutableContext()
  CustomDiffAction({setState}: StateContext<StateModel>, {payload: {items}}: CustomDiffAction) {
  }

  @Action(QueryAction, {cancelUncompleted: true})
  @ImmutableContext()
  QueryAction({setState}: StateContext<StateModel>, {payload: {workshopId, date}}: QueryAction) {
    return this.api.statisticReportDay({workshopId, date: `${moment(date).format('YYYY-MM-DD')}`}).pipe(
      tap(report => setState((state: StateModel) => {
        state.workshopId = workshopId;
        state.date = moment(date).valueOf();
        state.report = report;
        return state;
      })),
    );
  }

  @Action(DownloadAction, {cancelUncompleted: true})
  @ImmutableContext()
  DownloadAction({getState}: StateContext<StateModel>) {
    // return this.api.listWorkshop().pipe(
    //   tap(() => {
    //     window.open('http://10.2.0.215:9998/api/reports/statisticReport/download?workshopId=5bffa63d8857b85a437d1fc5&startDate=2019-09-25&endDate=2019-09-25');
    //   })
    // );
    const {workshopId, date, workshopEntities} = getState();
    const dateString = moment(date).format('YYYY-MM-DD');
    const workshop = workshopEntities[workshopId];
    return this.api.downloadStatisticReport({workshopId, startDate: `${dateString}`, endDate: `${dateString}`}).pipe(
      tap(res => saveAs(res.body, `${workshop.code}.${dateString}.xlsx`)),
    );
  }

}
