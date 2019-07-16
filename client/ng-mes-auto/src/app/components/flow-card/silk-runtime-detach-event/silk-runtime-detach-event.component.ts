import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {Store} from '@ngxs/store';
import {SilkRuntimeDetachEvent} from '../../../models/event-source';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';
import {SilkRuntime} from '../../../models/silk-runtime';
import {AppState} from '../../../store/app.state';

@Component({
  selector: 'app-silk-runtime-detach-event',
  templateUrl: './silk-runtime-detach-event.component.html',
  styleUrls: ['./silk-runtime-detach-event.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkRuntimeDetachEventComponent {
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;
  // tslint:disable-next-line:variable-name
  _event: SilkRuntimeDetachEvent;
  displayedColumns = ['position', 'spec', 'code', 'grade'];
  dataSource: MatTableDataSource<SilkRuntime>;

  constructor(private store: Store) {
  }

  @Input()
  set event(ev: SilkRuntimeDetachEvent) {
    this._event = ev;
    this.dataSource = new MatTableDataSource(ev.silkRuntimes.sort((a, b) => {
      return `${a.sideType}${a.row}${a.col}`.localeCompare(`${b.sideType}${b.row}${b.col}`);
    }));
    // this.dataSource = new MatTableDataSource(ev.silkRuntimes);
  }

  get event(): SilkRuntimeDetachEvent {
    return this._event;
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
