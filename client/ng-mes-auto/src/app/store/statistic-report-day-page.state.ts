import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import * as moment from 'moment';
import {tap} from 'rxjs/operators';
import {StatisticReportDay, XlsxItem} from '../models/statistic-report-day';
import {Workshop} from '../models/workshop';
import {ApiService} from '../services/api.service';
import {CODE_COMPARE} from '../services/util.service';

const PAGE_NAME = 'StatisticReportDayPageState';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class QueryAction {
  static readonly type = `[${PAGE_NAME}] QueryAction`;

  constructor(public payload: { workshopId: string; date: Date; }) {
  }
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

  @Action(QueryAction)
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

}
