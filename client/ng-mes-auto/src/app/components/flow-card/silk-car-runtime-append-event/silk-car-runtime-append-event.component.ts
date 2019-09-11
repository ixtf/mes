import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {Store} from '@ngxs/store';
import {SilkRuntimeAppendEvent} from '../../../models/event-source';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';
import {SilkRuntime} from '../../../models/silk-runtime';

@Component({
  selector: 'app-silk-car-runtime-append-event',
  templateUrl: './silk-car-runtime-append-event.component.html',
  styleUrls: ['./silk-car-runtime-append-event.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkCarRuntimeAppendEventComponent {
  displayedColumns = ['position', 'spec', 'doffingNum', 'code', 'grade'];
  dataSource: MatTableDataSource<SilkRuntime>;
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;

  constructor(private store: Store) {
  }

  private _event: SilkRuntimeAppendEvent;

  get event(): SilkRuntimeAppendEvent {
    return this._event;
  }

  @Input()
  set event(ev: SilkRuntimeAppendEvent) {
    this._event = ev;
    this.dataSource = new MatTableDataSource(ev.silkRuntimes.sort((a, b) => a.silk.code.localeCompare(b.silk.code)));
  }

  canUndo(): boolean {
    return false;
    // const isAdmin = this.store.selectSnapshot(AppState.authInfoIsAdmin);
    // if (isAdmin) {
    //   return true;
    // }
    // const authInfo = this.store.selectSnapshot(AppState.authInfo);
    // return authInfo.id === this.event.operator.id;
  }
}
