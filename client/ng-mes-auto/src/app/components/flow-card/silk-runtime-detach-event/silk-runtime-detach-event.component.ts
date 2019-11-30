import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {Store} from '@ngxs/store';
import {SilkRuntimeDetachEvent} from '../../../models/event-source';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';
import {SilkRuntime} from '../../../models/silk-runtime';
import {AppState} from '../../../pages/app/app.state';

@Component({
  selector: 'app-silk-runtime-detach-event',
  templateUrl: './silk-runtime-detach-event.component.html',
  styleUrls: ['./silk-runtime-detach-event.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkRuntimeDetachEventComponent {
  displayedColumns = ['position', 'spec', 'doffingNum', 'code', 'grade'];
  dataSource: MatTableDataSource<SilkRuntime>;
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;

  constructor(private store: Store) {
  }

  _event: SilkRuntimeDetachEvent;

  get event(): SilkRuntimeDetachEvent {
    return this._event;
  }

  @Input()
  set event(ev: SilkRuntimeDetachEvent) {
    this._event = ev;
    this.dataSource = new MatTableDataSource(ev.silkRuntimes.sort((a, b) => {
      return `${a.sideType}${a.row}${a.col}`.localeCompare(`${b.sideType}${b.row}${b.col}`);
    }));
    // this.dataSource = new MatTableDataSource(ev.silkRuntimes);
  }

  canUndo(): boolean {
    const isAdmin = this.store.selectSnapshot(AppState.authInfoIsAdmin);
    if (isAdmin) {
      return true;
    }
    const authInfo = this.store.selectSnapshot(AppState.authInfo);
    return authInfo.id === this.event.operator.id;
  }
}
