import {TranslateService} from '@ngx-translate/core';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import * as moment from 'moment';
import {tap} from 'rxjs/operators';
import {Batch} from '../../../models/batch';
import {Line} from '../../../models/line';
import {Product} from '../../../models/product';
import {SilkException} from '../../../models/silk-exception';
import {Workshop} from '../../../models/workshop';
import {ApiService} from '../../../services/api.service';
import {CODE_COMPARE, LINE_COMPARE} from '../../../services/util.service';

const PAGE_NAME = 'SilkExceptionReportPage';

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

export class DisplayItem {
  productSum: boolean;
  product: Product;
  line: Line;
  batch: Batch;
  groupBySilkException: GroupBySilkException[];
}

export class SilkExceptionReportItem {
  line: Line;
  groupByBatch: GroupByBatch[];
}

export class GroupByBatch {
  batch: Batch;
  groupBySilkException: GroupBySilkException[];
}

export class GroupBySilkException {
  silkException: SilkException;
  silkCount = 0;
}

interface StateModel {
  workshopId?: string;
  startDateTime?: number;
  endDateTime?: number;
  workshopEntities: { [id: string]: Workshop };
  items?: SilkExceptionReportItem[];
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    workshopEntities: {},
  },
})
export class SilkExceptionReportPageState {
  constructor(private api: ApiService,
              private translate: TranslateService) {
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
  static startDateTime(state: StateModel): number {
    return state.startDateTime;
  }

  @Selector()
  @ImmutableSelector()
  static startDate_hour(state: StateModel): number {
    const startMoment = state.startDateTime && moment(state.startDateTime);
    return startMoment && startMoment.hour() || 8;
  }

  @Selector()
  @ImmutableSelector()
  static startDate_minute(state: StateModel): number {
    const startMoment = state.startDateTime && moment(state.startDateTime);
    return startMoment && startMoment.minute() || 0;
  }

  @Selector()
  @ImmutableSelector()
  static endDateTime(state: StateModel): number {
    return state.endDateTime;
  }

  @Selector()
  @ImmutableSelector()
  static endDate_hour(state: StateModel): number {
    const startMoment = state.endDateTime && moment(state.endDateTime);
    return startMoment && startMoment.hour() || 8;
  }

  @Selector()
  @ImmutableSelector()
  static endDate_minute(state: StateModel): number {
    const startMoment = state.endDateTime && moment(state.endDateTime);
    return startMoment && startMoment.minute() || 0;
  }

  @Selector()
  @ImmutableSelector()
  static workshops(state: StateModel): Workshop[] {
    return Object.values(state.workshopEntities).sort(CODE_COMPARE);
  }

  @Selector()
  @ImmutableSelector()
  static silkExceptions(state: StateModel): SilkException[] {
    const exceptionMap: { [id: string]: SilkException } = {};
    (state.items || []).forEach(item => {
      (item.groupByBatch || []).forEach(groupByBatch => {
        (groupByBatch.groupBySilkException || []).forEach(groupByException => {
          const {silkException} = groupByException;
          if (!exceptionMap[silkException.id]) {
            exceptionMap[silkException.id] = silkException;
          }
        });
      });
    });
    console.log(exceptionMap);
    return Object.values(exceptionMap).sort((a, b) => a.id.localeCompare(b.id));
  }

  @Selector()
  @ImmutableSelector()
  static items(state: StateModel): DisplayItem[] {
    const productMap: { [id: string]: DisplayItem } = {};
    const displayItems: DisplayItem[] = [];
    (state.items || []).forEach(item => {
      const {line} = item;
      (item.groupByBatch || []).forEach(groupByBatch => {
        const {batch} = groupByBatch;
        const {product} = batch;
        const displayItem = new DisplayItem();
        displayItem.product = product;
        displayItem.line = line;
        displayItem.batch = batch;
        displayItem.groupBySilkException = groupByBatch.groupBySilkException || [];
        displayItems.push(displayItem);
        let productSumItem = productMap[product.id];
        if (!productSumItem) {
          productSumItem = new DisplayItem();
          productSumItem.productSum = true;
          productSumItem.product = product;
          productSumItem.groupBySilkException = [];
          productMap[product.id] = productSumItem;
        }
        displayItem.groupBySilkException.forEach(groupByException => {
          const {silkException, silkCount} = groupByException;
          let groupByExceptionToAdd = productSumItem.groupBySilkException.find(it => it.silkException.id === silkException.id);
          if (!groupByExceptionToAdd) {
            groupByExceptionToAdd = new GroupBySilkException();
            groupByExceptionToAdd.silkException = silkException;
            groupByExceptionToAdd.silkCount = silkCount;
            productSumItem.groupBySilkException.push(groupByExceptionToAdd);
          } else {
            groupByExceptionToAdd.silkCount += silkCount;
          }
        });
      });
    });
    return displayItems.concat(Object.values(productMap)).sort((a, b) => {
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
        state.items = items;
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

    // const headerItem = ['人员'];
    // const dyeingTypes = ['FIRST', 'SECOND', 'CROSS_LINEMACHINE_SPINDLE', 'CROSS_LINEMACHINE_LINEMACHINE', 'THIRD'];
    // const translateKeyFun = it => 'DyeingType.' + it;
    // this.translate.get(dyeingTypes.map(translateKeyFun)).subscribe(translateObj => {
    //   dyeingTypes.forEach(it => headerItem.push(translateObj[translateKeyFun(it)]));
    //   const data = [headerItem];
    //   (SilkExceptionReportPageState.items(getState()) || []).forEach(item => {
    //     const xlsxItem = [];
    //     const {operator, groupByDyeingTypes} = item;
    //     xlsxItem.push(operator.name);
    //     dyeingTypes.forEach(dyeingType => {
    //       const groupByDyeingType = groupByDyeingTypes.find(it => it.dyeingType === dyeingType);
    //       if (groupByDyeingType) {
    //         xlsxItem.push(groupByDyeingType.silkCount);
    //       } else {
    //         xlsxItem.push('');
    //       }
    //     });
    //     data.push(xlsxItem);
    //   });
    //   if (data.length > 1) {
    //     const wb = XLSX.utils.book_new();
    //     const ws = XLSX.utils.aoa_to_sheet(data);
    //     // ws['!merges'] = ws['!merges'] || [];
    //     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    //     XLSX.writeFile(wb, fileName);
    //   }
    // });
  }

}
