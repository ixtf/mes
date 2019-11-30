import {ChangeDetectionStrategy, Component, HostBinding, NgModule, OnDestroy} from '@angular/core';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {EB_URL} from '../../../../environments/environment';
import {ExceptionRecord} from '../../../models/exception-record';
import {Notification} from '../../../models/notification';
import {Item} from '../../../models/workshop-product-plan-report';
import {INTERVAL$} from '../../../services/util.service';
import {SharedModule} from '../../../shared.module';
import {BoardAbnormalPageState, InitAction, UpdateExceptionRecordAction, UpdateNotificationAction, UpdateProductPlanRecordAction} from './board-abnormal-page.state';

declare const EventBus: any;

@Component({
  templateUrl: './board-abnormal-page.component.html',
  styleUrls: ['./board-abnormal-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardAbnormalPageComponent implements OnDestroy {
  @Select(BoardAbnormalPageState.productPlanItems)
  readonly productPlanItems$: Observable<Item[]>;
  @Select(BoardAbnormalPageState.exceptionRecords)
  readonly exceptionRecords$: Observable<ExceptionRecord[]>;
  @Select(BoardAbnormalPageState.notifications)
  readonly notifications$: Observable<Notification[]>;
  @HostBinding('class.board-page')
  private readonly b = true;
  private readonly destroy$ = new Subject();
  readonly currentDateTime$ = INTERVAL$.pipe(
    takeUntil(this.destroy$),
    map(() => new Date()),
  );
  private readonly eb;

  constructor(private store: Store,
              private route: ActivatedRoute) {
    route.queryParams.subscribe((it: any) => store.dispatch(new InitAction(it)));
    this.eb = new EventBus(EB_URL);
    this.eb.enableReconnect(true);
    this.eb.onreconnect = this.onreconnect;
    this.eb.onopen = () => {
      this.eb.registerHandler('mes-auto://websocket/boards/abnormal/refresh', this.refresh);
      this.eb.registerHandler('mes-auto://websocket/boards/abnormal/exceptionRecord', this.updateExceptionRecord);
      this.eb.registerHandler('mes-auto://websocket/boards/abnormal/productPlan', this.updateProductPlanRecord);
      this.eb.registerHandler('mes-auto://websocket/boards/abnormal/notification', this.updateNotification);
    };
  }

  ngOnDestroy(): void {
    if (this.eb) {
      this.eb.close();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private refresh() {
    return location.reload(true);
  }

  private onreconnect() {
    setTimeout(() => location.reload(true), 30 * 1000);
  }

  @Dispatch()
  private updateExceptionRecord(error, message) {
    const exceptionRecord = JSON.parse(message.body);
    return new UpdateExceptionRecordAction({exceptionRecord});
  }

  @Dispatch()
  private updateProductPlanRecord(error, message) {
    const lineMachineProductPlan = JSON.parse(message.body);
    return new UpdateProductPlanRecordAction({lineMachineProductPlan});
  }

  @Dispatch()
  private updateNotification(error, message) {
    const notification = JSON.parse(message.body);
    return new UpdateNotificationAction({notification});
  }

}

@NgModule({
  declarations: [
    BoardAbnormalPageComponent,
  ],
  imports: [
    NgxsModule.forFeature([BoardAbnormalPageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: BoardAbnormalPageComponent},
    ]),
  ],
})
export class Module {
}
