import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Store} from '@ngxs/store';
import {ToDtyConfirmEvent} from '../../../models/event-source';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';
import {AppState} from '../../../store/app.state';

@Component({
  selector: 'app-to-dty-confirm-event',
  templateUrl: './to-dty-confirm-event.component.html',
  styleUrls: ['./to-dty-confirm-event.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToDtyConfirmEventComponent {
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;

  constructor(private store: Store) {
  }

  _event: ToDtyConfirmEvent;

  get event(): ToDtyConfirmEvent {
    return this._event;
  }

  @Input()
  set event(ev: ToDtyConfirmEvent) {
    this._event = ev;
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
