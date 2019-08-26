import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {EventSource, ToDtyConfirmEvent} from '../../../models/event-source';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRecordDestination} from '../../../models/silk-car-record-destination';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';
import {ApiService} from '../../../services/api.service';
import {AppState} from '../../../store/app.state';

@Component({
  selector: 'app-to-dty-confirm-event',
  templateUrl: './to-dty-confirm-event.component.html',
  styleUrls: ['./to-dty-confirm-event.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToDtyConfirmEventComponent {
  $destination: Observable<SilkCarRecordDestination>;
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;
  private _event: ToDtyConfirmEvent;

  constructor(private store: Store,
              private api: ApiService) {
  }

  get event(): ToDtyConfirmEvent {
    return this._event;
  }

  @Input()
  set event(ev: ToDtyConfirmEvent) {
    this._event = ev;
    this.$destination = this.api.getSilkCarRecordDestination(ev.command.destination.id);
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
    const isAdmin = this.store.selectSnapshot(AppState.authInfoIsAdmin);
    if (isAdmin) {
      return true;
    }
    const authInfo = this.store.selectSnapshot(AppState.authInfo);
    return authInfo.id === this.event.operator.id;
  }

}
