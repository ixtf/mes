import {ChangeDetectionStrategy, Component, EventEmitter, Input, NgModule, Output} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {LineMachine} from '../../models/line-machine';
import {Silk} from '../../models/silk';
import {SilkCarRecord} from '../../models/silk-car-record';
import {SilkCarRuntime} from '../../models/silk-car-runtime';
import {SilkRuntime} from '../../models/silk-runtime';
import {COPY} from '../../services/util.service';
import {SharedModule} from '../../shared.module';

export class SilkModel extends Silk {
  sideType: string;
  row: number;
  col: number;
  selected = false;
  exceptions: string[] = [];

  get hasException(): boolean {
    return this.exceptions && this.exceptions.length > 0;
  }

  get tooltip(): string {
    return this.hasException ? this.exceptions.join(';') : '';
  }
}

export class SilkCarRecordInfoModel extends SilkCarRecord {
  aSideSilks: SilkModel[] = [];
  bSideSilks: SilkModel[] = [];

  get validSideSilks(): SilkModel[] {
    return [...this.aSideSilks, ...this.bSideSilks].filter(it => it.id);
  }
}

class LineMachineSelectBtn {
  constructor(private lineMachine: LineMachine,
              private doffingNum: string) {
  }

  get label(): string {
    return [this.lineMachine.line.name, this.lineMachine.item, this.doffingNum].join('-');
  }

  same(silkModel: SilkModel): boolean {
    return silkModel.lineMachine.id === this.lineMachine.id && silkModel.doffingNum === this.doffingNum;
  }
}

@Component({
  selector: 'app-silk-car-record-info',
  templateUrl: './silk-car-record-info.component.html',
  styleUrls: ['./silk-car-record-info.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkCarRecordInfoComponent {
  copy = COPY;
  silkCarRecordInfo: SilkCarRecordInfoModel;
  lineMachineSelectBtns: LineMachineSelectBtn[];
  @Output()
  silkSelectionListChange = new EventEmitter<string[]>();

  constructor(private snackBar: MatSnackBar) {
  }

  // tslint:disable-next-line:variable-name
  private _silkCarRuntime: SilkCarRuntime;

  @Input()
  set silkCarRuntime(silkCarRuntime: SilkCarRuntime) {
    this._silkCarRuntime = silkCarRuntime;
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

  // tslint:disable-next-line:variable-name
  private _silkCarRecord: SilkCarRecord;

  @Input()
  set silkCarRecord(silkCarRecord: SilkCarRecord) {
    this._silkCarRecord = silkCarRecord;
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
