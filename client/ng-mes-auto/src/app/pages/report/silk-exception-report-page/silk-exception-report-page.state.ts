import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import * as moment from 'moment';
import {Moment} from 'moment';
import {retry, tap} from 'rxjs/operators';
import * as XLSX from 'xlsx';
import {SilkException} from '../../../models/silk-exception';
import {Workshop} from '../../../models/workshop';
import {ApiService} from '../../../services/api.service';
import {CODE_COMPARE, LINE_COMPARE} from '../../../services/util.service';
import {DisplayItem, DownloadAction, GradeItem, InitAction, PAGE_NAME, QueryAction, SilkExceptionItem, SilkExceptionReportItem, StateModel} from './silk-exception-report-page.z';

export const FIX_COLS = ['product', 'line', 'batchNo', 'batchSpec', 'doffingCount'];
export const GRADE_CODES = ['A', 'B', 'C'];

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    workshopEntities: {},
  },
})
export class SilkExceptionReportPageState {
  constructor(private api: ApiService) {
  }

  static storageIds(): string[] {
    return [`${PAGE_NAME}.workshopId`, `${PAGE_NAME}.startDateTime`, `${PAGE_NAME}.endDateTime`];
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
  static workshops(state: StateModel): Workshop[] {
    return Object.values(state.workshopEntities).sort(CODE_COMPARE);
  }

  @Selector()
  @ImmutableSelector()
  static displayedColumns(state: StateModel): string[] {
    return state.displayedColumns || FIX_COLS;
  }

  @Selector()
  @ImmutableSelector()
  static silkExceptionCols(state: StateModel): SilkException[] {
    return state.silkExceptions || [];
  }

  @Selector()
  @ImmutableSelector()
  static items(state: StateModel): DisplayItem[] {
    return state.displayItems || [];
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
    return this.api.silkExceptionReport({workshopId, startDateTime: `${moment(startDateTime).valueOf()}`, endDateTime: `${moment(endDateTime).valueOf()}`}).pipe(
      tap(items => setState((state: StateModel) => {
        state.reportItems = items;
        state.displayItems = this.calcDisplayItems(state);
        state.silkExceptions = this.calcSilkExceptions(state);
        const expCols = state.silkExceptions.map(it => it.id);
        state.displayedColumns = FIX_COLS.concat(expCols).concat(GRADE_CODES);
        return state;
      })),
      retry(3),
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

  private calcSilkExceptions(state: StateModel) {
    const map: { [id: string]: SilkException } = {};
    (state.reportItems || []).forEach(item => {
      (item.silkExceptionItems || []).forEach(silkExceptionItem => {
        const {silkException} = silkExceptionItem;
        if (!map[silkException.id]) {
          map[silkException.id] = silkException;
        }
      });
    });
    return Object.values(map).sort((a, b) => a.id.localeCompare(b.id));
  }

  private calcDisplayItems(state: StateModel) {
    const productSumMap: { [id: string]: DisplayItem } = {};
    (state.reportItems || []).forEach(item => {
      const productSumItem = this.getOrAddProductSum(productSumMap, item);
      productSumItem.silkCount += (item.silkCount || 0);
      item.silkExceptionItems.forEach(silkExceptionItem => {
        const toAdd = this.getOrAddSilkExceptionItem(productSumItem.silkExceptionItems, silkExceptionItem);
        toAdd.silkCount += silkExceptionItem.silkCount;
      });
      item.gradeItems.forEach(gradeItem => {
        const toAdd = this.getOrAddGradeItem(productSumItem.gradeItems, gradeItem);
        toAdd.silkCount += gradeItem.silkCount;
      });
    });

    return (state.reportItems || []).map(it => {
      const ret = DisplayItem.assign(it);
      ret.product = it.batch.product;
      return ret;
    }).concat(Object.values(productSumMap))
      .sort((a, b) => {
        const productIdx = a.product.name.localeCompare(b.product.name);
        if (productIdx !== 0) {
          return productIdx;
        }
        if (a.productSum !== b.productSum) {
          return a.productSum ? 1 : -1;
        }
        const lineIdx = LINE_COMPARE(a.line, b.line);
        if (lineIdx !== 0) {
          return lineIdx;
        }
        return a.batch.batchNo.localeCompare(b.batch.batchNo);
      });
  }

  private getOrAddProductSum(map: { [id: string]: DisplayItem }, item: SilkExceptionReportItem) {
    const {batch: {product}, line} = item;
    let ret = map[product.id];
    if (!ret) {
      ret = new DisplayItem();
      ret.productSum = true;
      ret.line = line;
      ret.product = product;
      ret.silkCount = 0;
      ret.silkExceptionItems = [];
      ret.gradeItems = [];
      map[product.id] = ret;
    }
    return ret;
  }

  private getOrAddSilkExceptionItem(items: SilkExceptionItem[], item: SilkExceptionItem) {
    const {silkException} = item;
    let ret = items.find(it => it.silkException.id === silkException.id);
    if (!ret) {
      ret = new SilkExceptionItem();
      ret.silkException = silkException;
      ret.silkCount = 0;
      items.push(ret);
    }
    return ret;
  }

  private getOrAddGradeItem(items: GradeItem[], item: GradeItem) {
    const {grade} = item;
    let ret = items.find(it => it.grade.id === grade.id);
    if (!ret) {
      ret = new GradeItem();
      ret.grade = grade;
      ret.silkCount = 0;
      items.push(ret);
    }
    return ret;
  }
}
