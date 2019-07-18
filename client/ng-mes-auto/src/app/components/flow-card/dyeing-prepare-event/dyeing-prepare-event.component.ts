import {animate, state, style, transition, trigger} from '@angular/animations';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatDialog, MatTableDataSource} from '@angular/material';
import {DyeingPrepare} from '../../../models/dyeing-prepare';
import {DyeingResult} from '../../../models/dyeing-result';
import {DyeingPrepareEvent} from '../../../models/event-source';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';
import {CodeCompare} from '../../../services/util.service';

@Component({
  selector: 'app-dyeing-prepare-event',
  templateUrl: './dyeing-prepare-event.component.html',
  styleUrls: ['./dyeing-prepare-event.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DyeingPrepareEventComponent {
  @Input()
  event: DyeingPrepareEvent;
  displayedColumns = ['position', 'spec', 'code', 'result'];
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;

  constructor(private dialog: MatDialog) {
  }

  get dyeingPrepare(): DyeingPrepare {
    return this.event.dyeingPrepare;
  }

  get dataSource() {
    return new MatTableDataSource(this.dyeingPrepare.dyeingResults.sort((a, b) => {
      return CodeCompare(a.silk, b.silk);
    }));
  }

  canUndo(): boolean {
    return false;
  }

  undo() {
    // this.dialog.open();
  }

  calcPosition(dyeingResult: DyeingResult): string {
    const silkCarRecord = (this.silkCarRuntime && this.silkCarRuntime.silkCarRecord) || this.silkCarRecord;
    const initSilks = silkCarRecord && silkCarRecord.initSilks || [];
    const silkRuntime = initSilks.find(it => it.silk.id === dyeingResult.silk.id);
    if (silkRuntime) {
      return [silkRuntime.sideType, silkRuntime.row, silkRuntime.col].join('-');
    }
    return '-';
  }
}
