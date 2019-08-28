import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatDialog} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {EventSource, ToDtyConfirmEvent} from '../../../models/event-source';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRecordDestination} from '../../../models/silk-car-record-destination';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';
import {ApiService} from '../../../services/api.service';
import {AppState} from '../../../store/app.state';
import {ConfirmDialogComponent} from '../../confirm-dialog/confirm-dialog.component';

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
              private api: ApiService,
              private translate: TranslateService,
              private dialog: MatDialog) {
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
    if (!this.silkCarRuntime) {
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
    ).subscribe();
  }

}
