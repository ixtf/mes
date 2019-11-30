import {ChangeDetectionStrategy, Component, EventEmitter, Input, NgModule, Output} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Select, Store} from '@ngxs/store';
import {BehaviorSubject, Observable} from 'rxjs';
import {ProductProcess} from '../../models/product-process';
import {SilkCarRecord} from '../../models/silk-car-record';
import {SilkCarRuntime} from '../../models/silk-car-runtime';
import {SilkRuntime} from '../../models/silk-runtime';
import {AppState} from '../../pages/app/app.state';
import {ApiService} from '../../services/api.service';
import {COPY} from '../../services/util.service';
import {SharedModule} from '../../shared.module';
import {LineMachineSelectBtn, SilkCarRecordInfoModel, SilkModel} from './silk-car-record-info.help';
import {ToDtyConfirmEventDialogComponent} from './to-dty-confirm-event-dialog/to-dty-confirm-event-dialog.component';

@Component({
  selector: 'app-silk-car-record-info',
  templateUrl: './silk-car-record-info.component.html',
  styleUrls: ['./silk-car-record-info.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkCarRecordInfoComponent {
  readonly copy = COPY;
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  silkCarRecordInfo: SilkCarRecordInfoModel;
  lineMachineSelectBtns: LineMachineSelectBtn[];
  readonly productProcesses$ = new BehaviorSubject<ProductProcess[]>([]);
  @Output()
  silkSelectionListChange = new EventEmitter<string[]>();

  constructor(private store: Store,
              private api: ApiService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar) {
  }

  private _silkCarRuntime: SilkCarRuntime;

  @Input()
  set silkCarRuntime(silkCarRuntime: SilkCarRuntime) {
    this._silkCarRuntime = silkCarRuntime;
    this.api.getProduct_ProductProcess(silkCarRuntime.silkCarRecord.batch.product.id).subscribe(it => {
      this.productProcesses$.next(it);
    });
    // SilkCarRecordInfoModel.buildBySilkCarRuntime({silkCarRuntime});
    this.lineMachineSelectBtns = [];
    const silkCarRecordInfo = this.silkCarRecordInfo || new SilkCarRecordInfoModel();
    const aSideSilks = [];
    const bSideSilks = [];
    for (let row = 1; row <= silkCarRuntime.silkCarRecord.silkCar.row; row++) {
      for (let col = 1; col <= silkCarRuntime.silkCarRecord.silkCar.col; col++) {
        aSideSilks.push(this.silkModel('A', row, col, silkCarRecordInfo.aSideSilks, silkCarRuntime.silkRuntimes));
        bSideSilks.push(this.silkModel('B', row, col, silkCarRecordInfo.bSideSilks, silkCarRuntime.silkRuntimes));
      }
    }
    this.silkCarRecordInfo = Object.assign(new SilkCarRecordInfoModel(), silkCarRuntime.silkCarRecord, {aSideSilks, bSideSilks});
    this.silkCarRecordInfo.validSideSilks.forEach(silkModel => {
      let btn = this.lineMachineSelectBtns.find(it => it.same(silkModel));
      if (!btn) {
        btn = new LineMachineSelectBtn(silkModel.lineMachine, silkModel.doffingNum);
        this.lineMachineSelectBtns.push(btn);
      }
    });
    this.lineMachineSelectBtns.sort((a, b) => a.label.localeCompare(b.label));
  }

  private _silkCarRecord: SilkCarRecord;

  @Input()
  set silkCarRecord(silkCarRecord: SilkCarRecord) {
    this._silkCarRecord = silkCarRecord;
    this.api.getProduct_ProductProcess(silkCarRecord.batch.product.id).subscribe(it => {
      this.productProcesses$.next(it);
    });
    const silkCarRecordInfo = this.silkCarRecordInfo || new SilkCarRecordInfoModel();
    const aSideSilks = [];
    const bSideSilks = [];
    for (let row = 1; row <= silkCarRecord.silkCar.row; row++) {
      for (let col = 1; col <= silkCarRecord.silkCar.col; col++) {
        aSideSilks.push(this.silkModel('A', row, col, silkCarRecordInfo.aSideSilks, silkCarRecord.initSilks));
        bSideSilks.push(this.silkModel('B', row, col, silkCarRecordInfo.bSideSilks, silkCarRecord.initSilks));
      }
    }
    this.silkCarRecordInfo = Object.assign(new SilkCarRecordInfoModel(), silkCarRecord, {aSideSilks, bSideSilks});
  }

  get isCurrent(): boolean {
    return !!this._silkCarRuntime;
  }

  get doffingOperatorName() {
    const operator = this.silkCarRecordInfo.doffingOperator || this.silkCarRecordInfo.carpoolOperator;
    return operator.name;
  }

  get doffingDateTime() {
    return this.silkCarRecordInfo.doffingDateTime || this.silkCarRecordInfo.carpoolDateTime;
  }

  get selectedCount() {
    return this.silkCarRecordInfo.validSideSilks.reduce((acc, cur) => cur.selected ? ++acc : acc, 0);
  }

  get canAddToDtyConfirmEvent(): boolean {
    if (!this._silkCarRuntime) {
      return false;
    }
    if (!this.store.selectSnapshot(AppState.authInfoIsAdmin)) {
      return false;
    }
    return true;
  }

  resetSelected() {
    this.silkCarRecordInfo.validSideSilks.forEach(it => it.selected = false);
    this.emitSilkSelectionListChange();
  }

  toggleSelect(silk: SilkModel) {
    silk.selected = !silk.selected;
    this.emitSilkSelectionListChange();
  }

  selectBySide(silks: SilkModel[]) {
    silks.forEach(it => it.selected = true);
    this.emitSilkSelectionListChange();
  }

  selectByLineMachine(btn: LineMachineSelectBtn) {
    this.silkCarRecordInfo.validSideSilks.filter(it => btn.same(it)).forEach(it => it.selected = true);
    this.emitSilkSelectionListChange();
  }

  addToDtyConfirmEvent() {
    ToDtyConfirmEventDialogComponent.open(this.dialog, this._silkCarRuntime);
  }

  private silkModel(sideType: string, row: number, col: number, silkModels: SilkModel[], silkRuntimes: SilkRuntime[]): SilkModel {
    const result = Object.assign(new SilkModel(), {sideType, row, col});
    const predicate = it => it.sideType === sideType && it.row === row && it.col === col;
    const silkRuntime = silkRuntimes.find(predicate);
    if (silkRuntime) {
      const {silk, grade} = silkRuntime;
      const exceptions = (silkRuntime.exceptions || []).map(it => it.name);
      Object.assign(result, silk, {grade, exceptions});
    }
    const silkModel = silkModels.find(predicate);
    if (silkModel && result.id === silkModel.id) {
      const {selected} = silkModel;
      Object.assign(result, {selected});
    }
    return result;
  }

  private emitSilkSelectionListChange() {
    const result = this.silkCarRecordInfo.validSideSilks.filter(it => it.selected).map(it => it.id);
    this.silkSelectionListChange.emit(result);
  }
}

@NgModule({
  declarations: [
    SilkCarRecordInfoComponent,
    ToDtyConfirmEventDialogComponent,
  ],
  entryComponents: [
    ToDtyConfirmEventDialogComponent,
  ],
  imports: [
    SharedModule,
  ],
  exports: [
    SilkCarRecordInfoComponent,
  ],
})
export class SilkCarRecordInfoComponentModule {
}
