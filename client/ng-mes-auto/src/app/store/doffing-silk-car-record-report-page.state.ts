import {HttpParams} from '@angular/common/http';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import * as moment from 'moment';
import {tap} from 'rxjs/operators';
import {DoffingSilkCarRecordReportItem} from '../models/doffing-silk-car-record-report';
import {ApiService} from '../services/api.service';

export class QueryAction {
  static readonly type = '[DoffingSilkCarRecordReportPage] QueryAction';

  constructor(public payload: { workshopId: string; startDate: Date; endDate: Date; }) {
  }
}

interface StateModel {
  items?: DoffingSilkCarRecordReportItem[];
}

@State<StateModel>({
  name: 'DoffingSilkCarRecordReportPage',
  defaults: {}
})
export class DoffingSilkCarRecordReportPageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static items(state: StateModel): DoffingSilkCarRecordReportItem[] {
    return state.items;
  }

  @Action(QueryAction)
  @ImmutableContext()
  QueryAction({setState}: StateContext<StateModel>, {payload: {workshopId, startDate, endDate}}: QueryAction) {
    const httpParams = new HttpParams().set('workshopId', workshopId)
      .append('startDate', moment(startDate).format('YYYY-MM-DD'))
      .append('endDate', moment(endDate).format('YYYY-MM-DD'));
    return this.api.doffingSilkCarRecordReport(httpParams).pipe(
      tap(items => setState((state: StateModel) => {
        state.items = items;
        return state;
      }))
    );
  }

}
