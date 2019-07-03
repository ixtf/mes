import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatTableDataSource, Sort} from '@angular/material';
import {Store} from '@ngxs/store';
import {SilkNoteFeedbackEvent, SilkRuntimeDetachEvent} from '../../../models/event-source';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';
import {SilkRuntime} from '../../../models/silk-runtime';
import {AppState} from '../../../store/app.state';

@Component({
  selector: 'app-silk-note-feedback-event',
  templateUrl: './silk-note-feedback-event.component.html',
  styleUrls: ['./silk-note-feedback-event.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkNoteFeedbackEventComponent {
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;
  // tslint:disable-next-line:variable-name
  private _event: SilkNoteFeedbackEvent;

  constructor(private store: Store) {
  }

  @Input()
  set event(ev: SilkNoteFeedbackEvent) {
    this._event = ev;
  }

  get event(): SilkNoteFeedbackEvent {
    return this._event;
  }

  canUndo(): boolean {
    const isAdmin = this.store.selectSnapshot(AppState.isAdmin);
    if (isAdmin) {
      return true;
    }
    const authInfo = this.store.selectSnapshot(AppState.authInfo);
    return authInfo.id === this.event.operator.id;
  }
}
