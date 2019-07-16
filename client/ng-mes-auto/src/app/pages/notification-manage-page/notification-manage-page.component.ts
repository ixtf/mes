import {ChangeDetectionStrategy, Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {combineLatest, Observable, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ExceptionRecord} from '../../models/exception-record';
import {Notification} from '../../models/notification';
import {ApiService} from '../../services/api.service';
import {SharedModule} from '../../shared.module';
import {AppState} from '../../store/app.state';
import {InitAction, NotificationManagePageState, SaveAction} from '../../store/notification-manage-page.state';
// @ts-ignore
import {NotificationUpdateDialogComponent} from './notification-update-dialog/notification-update-dialog.component';

@Component({
  templateUrl: './notification-manage-page.component.html',
  styleUrls: ['./notification-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationManagePageComponent implements OnInit, OnDestroy {
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(AppState.authInfoId)
  readonly authInfoId$: Observable<string>;
  @Select(NotificationManagePageState.notifications)
  readonly notifications$: Observable<Notification[]>;
  readonly displayedColumns = ['workshops', 'lines', 'note', 'modifier', 'modifyDateTime', 'btns'];
  private readonly destroy$ = new Subject();

  constructor(private store: Store,
              private dialog: MatDialog,
              private api: ApiService) {
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

  }

  isShow(row: ExceptionRecord) {
    const isSelf$ = this.authInfoId$.pipe(
      map(it => it === row.creator.id)
    );
    return combineLatest([this.authInfoId$, this.isAdmin$]).pipe(
      map(([isSelf, isAdmin]) => isAdmin || isSelf)
    );
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
