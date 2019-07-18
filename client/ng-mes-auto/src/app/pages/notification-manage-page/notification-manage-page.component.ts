import {ChangeDetectionStrategy, Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ExceptionRecord} from '../../models/exception-record';
import {Notification} from '../../models/notification';
import {SharedModule} from '../../shared.module';
import {AppState} from '../../store/app.state';
import {DeleteAction, InitAction, NotificationManagePageState, SaveAction} from '../../store/notification-manage-page.state';
import {NotificationUpdateDialogComponent} from './notification-update-dialog/notification-update-dialog.component';

@Component({
  templateUrl: './notification-manage-page.component.html',
  styleUrls: ['./notification-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationManagePageComponent implements OnInit, OnDestroy {
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(NotificationManagePageState.notifications)
  readonly notifications$: Observable<Notification[]>;
  readonly displayedColumns = ['workshops', 'lines', 'note', 'modifier', 'modifyDateTime', 'btns'];
  private readonly destroy$ = new Subject();

  constructor(private store: Store,
              private dialog: MatDialog) {
    this.store.dispatch(new InitAction());
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  create() {
    this.update(new Notification());
  }

  @Dispatch()
  update(notification: Notification) {
    return NotificationUpdateDialogComponent.open(this.dialog, notification).afterClosed().pipe(
      filter(it => !!it),
      map(it => new SaveAction(it))
    );
  }

  @Dispatch()
  delete(notification: Notification) {
    return new DeleteAction(notification);
  }

  isShow(exceptionRecord: ExceptionRecord) {
    const isAdmin = this.store.selectSnapshot(AppState.authInfoIsAdmin);
    if (isAdmin) {
      return true;
    }
    const currentId = this.store.selectSnapshot(AppState.authInfoId);
    return exceptionRecord.creator.id === currentId;
  }
}

@NgModule({
  declarations: [
    NotificationManagePageComponent,
    NotificationUpdateDialogComponent,
  ],
  entryComponents: [
    NotificationUpdateDialogComponent
  ],
  imports: [
    NgxsModule.forFeature([NotificationManagePageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: NotificationManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
