import {LineMachine} from '../../models/line-machine';
import {Silk} from '../../models/silk';
import {SilkCarRecord} from '../../models/silk-car-record';
import {SilkCarRuntime} from '../../models/silk-car-runtime';

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

  static buildBySilkCarRuntime(data: { silkCarRuntime: SilkCarRuntime; }) {

  }
}

export class LineMachineSelectBtn {
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
