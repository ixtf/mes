import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import * as moment from 'moment';
import {tap} from 'rxjs/operators';
import {StatisticReportRange, XlsxItem} from '../models/statistic-report-day';
import {Workshop} from '../models/workshop';
import {ApiService} from '../services/api.service';
import {CODE_COMPARE} from '../services/util.service';

const PAGE_NAME = 'StatisticReportRangePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class QueryAction {
  static readonly type = `[${PAGE_NAME}] QueryAction`;

  constructor(public payload: { workshopId: string; startDate: Date; endDate: Date; }) {
  }
}

interface StateModel {
  workshopId?: string;
  startDate?: number;
  endDate?: number;
  workshopEntities: { [id: string]: Workshop };
  report?: StatisticReportRange;
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    workshopEntities: {},
  },
})
export class StatisticReportRangePageState {
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
  static report(state: StateModel): StatisticReportRange {
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
    return !!state.report;
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
  QueryAction({setState}: StateContext<StateModel>, {payload: {workshopId, startDate, endDate}}: QueryAction) {
    const body = {workshopId, startDate: `${moment(startDate).format('YYYY-MM-DD')}`, endDate: `${moment(endDate).format('YYYY-MM-DD')}`};
    return this.api.statisticReportRange(body).pipe(
      tap(report => setState((state: StateModel) => {
        state.workshopId = workshopId;
        state.startDate = moment(startDate).valueOf();
        state.endDate = moment(endDate).valueOf();
        state.report = report;
        return state;
      })),
    );
  }

}
