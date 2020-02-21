import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import * as moment from 'moment';
import {Moment} from 'moment';
import {tap} from 'rxjs/operators';
import * as XLSX from 'xlsx';
import {Workshop} from '../../../models/workshop';
import {ApiService} from '../../../services/api.service';
import {CODE_COMPARE} from '../../../services/util.service';
import {DownloadAction, InitAction, PAGE_NAME, QueryAction, SilkExceptionByClassReportItem, StateModel} from './silk-exception-by-class-report-page.z';

export const FIX_COLS = ['silkException'];

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    workshopEntities: {},
  },
})
@Injectable()
export class SilkExceptionByClassReportPageState {
  constructor(private api: ApiService,
              private translate: TranslateService) {
  }

  static storageIds(): string[] {
    return [`${PAGE_NAME}.workshopId`, `${PAGE_NAME}.startDateTime`, `${PAGE_NAME}.endDateTime`];
  }

  @Selector()
  @ImmutableSelector()
  static workshops(state: StateModel): Workshop[] {
    return Object.values(state.workshopEntities).sort(CODE_COMPARE);
  }

  @Selector()
  @ImmutableSelector()
  static workshopId(state: StateModel): string {
    return state.workshopId;
  }

  @Selector()
  @ImmutableSelector()
  static startDateTime(state: StateModel): Moment {
    return moment(state.startDateTime);
  }

  @Selector()
  @ImmutableSelector()
  static endDateTime(state: StateModel): Moment {
    return moment(state.endDateTime);
  }

  @Selector()
  @ImmutableSelector()
  static classCodes(state: StateModel): string[] {
    return state.classCodes || [];
  }

  @Selector()
  @ImmutableSelector()
  static items(state: StateModel): SilkExceptionByClassReportItem[] {
    return state.reportItems || [];
  }

  @Selector()
  @ImmutableSelector()
  static displayedColumns(state: StateModel): string[] {
    return state.displayedColumns || FIX_COLS;
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
  QueryAction({setState}: StateContext<StateModel>, {payload: {workshopId, startDateTime, endDateTime}}: QueryAction) {
    setState((state: StateModel) => {
      state.workshopId = workshopId;
      state.startDateTime = moment(startDateTime).valueOf();
      state.endDateTime = moment(endDateTime).valueOf();
      return state;
    });
    return this.api.silkExceptionByClassReport({workshopId, startDateTime: `${moment(startDateTime).valueOf()}`, endDateTime: `${moment(endDateTime).valueOf()}`}).pipe(
      tap(items => setState((state: StateModel) => {
        state.reportItems = items;
        state.classCodes = this.calcClassCodes(state);
        state.displayedColumns = FIX_COLS.concat(state.classCodes || []);
        return state;
      })),
    );
  }

  @Action(DownloadAction)
  @ImmutableContext()
  DownloadAction({getState}: StateContext<StateModel>) {
    const {workshopId, workshopEntities, startDateTime, endDateTime} = getState();
    const workshop = workshopEntities[workshopId];
    const startS = moment(startDateTime).format('YYYY-MM-DD HH:mm');
    const endS = moment(endDateTime).format('YYYY-MM-DD HH:mm');
    const fileName = workshop.name + '.' + startS + '~' + endS + '.xlsx';
    const tableDom = document.getElementById('table-report');
    const wb = XLSX.utils.table_to_book(tableDom);
    XLSX.writeFile(wb, fileName);
  }

  private calcClassCodes(state: StateModel) {
    const map: { [id: string]: any } = {};
    (state.reportItems || []).forEach(reportItem => {
      (reportItem.classCodeItems || []).forEach(classCodeItem => {
        map[classCodeItem.classCode] = classCodeItem;
      });
    });
    return Object.keys(map).sort((a, b) => a.localeCompare(b));
  }

}
