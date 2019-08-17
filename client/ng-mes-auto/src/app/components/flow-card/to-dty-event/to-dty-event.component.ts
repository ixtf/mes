import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatDialog} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Store} from '@ngxs/store';
import {switchMap, tap} from 'rxjs/operators';
import {EventSource, ToDtyEvent} from '../../../models/event-source';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';
import {ApiService} from '../../../services/api.service';
import {AppState} from '../../../store/app.state';
import {ConfirmDialogComponent} from '../../confirm-dialog/confirm-dialog.component';

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

  constructor(private store: Store,
              private api: ApiService,
              private translate: TranslateService,
              private dialog: MatDialog) {
  }

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

  undo() {
    ConfirmDialogComponent.openUndo(this.dialog).pipe(
      switchMap(() => {
        const {silkCarRecord: {silkCar: {code}}} = this.silkCarRuntime;
        return this.api.deleteEventSource(code, this.event.eventId);
      }),
      tap(() => {
        console.log('test');
      }),
    ).subscribe();
  }

}
