import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Store} from '@ngxs/store';
import {EventSource, ToDtyEvent} from '../../../models/event-source';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';
import {AppState} from '../../../store/app.state';

@Component({
  selector: 'app-to-dty-event',
  templateUrl: './to-dty-event.component.html',
  styleUrls: ['./to-dty-event.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToDtyEventComponent {
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;

  constructor(private store: Store) {
  }

  // tslint:disable-next-line:variable-name
  _event: ToDtyEvent;

  get event(): ToDtyEvent {
    return this._event;
  }

  @Input()
  set event(ev: ToDtyEvent) {
    this._event = ev;
  }

  get events(): EventSource[] {
    if (this.silkCarRuntime) {
      return this.silkCarRuntime.eventSources;
    }
    if (this.silkCarRecord) {
      return this.silkCarRecord.eventSources;
    }
    return null;
  }

  canUndo(): boolean {
    const confirmed = (this.events || []).find(it => !it.deleted && it.type === 'ToDtyConfirmEvent');
    if (confirmed) {
      return false;
    }
    const isAdmin = this.store.selectSnapshot(AppState.authInfoIsAdmin);
    if (isAdmin) {
      return true;
    }
    const authInfo = this.store.selectSnapshot(AppState.authInfo);
    return authInfo.id === this.event.operator.id;
  }
}
