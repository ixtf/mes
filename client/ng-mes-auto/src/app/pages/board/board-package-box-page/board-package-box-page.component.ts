import {ChangeDetectionStrategy, Component, ElementRef, HostBinding, HostListener, NgModule, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {interval, Observable, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {EB_URL, environment} from '../../../../environments/environment';
import {ExceptionRecord} from '../../../models/exception-record';
import {Notification} from '../../../models/notification';
import {Item} from '../../../models/workshop-product-plan-report';
import {FULL_SCREEN} from '../../../services/util.service';
import {SharedModule} from '../../../shared.module';
import {BoardAbnormalPageState, InitAction, ReconnectAction, RefreshAction, UpdateExceptionRecordAction, UpdateNotificationAction, UpdateProductPlanRecordAction} from '../../../store/board-abnormal-page.state';
import {BoardPackageBoxPageState} from '../../../store/board-package-box-page.state';

declare const EventBus: any;

@Component({
  templateUrl: './board-package-box-page.component.html',
  styleUrls: ['./board-package-box-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardPackageBoxPageComponent implements OnInit, OnDestroy {
  @Select(BoardAbnormalPageState.productPlanItems)
  readonly productPlanItems$: Observable<Item[]>;
  @Select(BoardAbnormalPageState.exceptionRecords)
  readonly exceptionRecords$: Observable<ExceptionRecord[]>;
  @Select(BoardAbnormalPageState.notifications)
  readonly notifications$: Observable<Notification[]>;
  @HostBinding('class.board-page')
  private readonly b = true;
  private readonly destroy$ = new Subject();
  readonly currentDateTime$ = interval(1000).pipe(
    takeUntil(this.destroy$),
    map(() => new Date()),
  );
  private readonly eb;

  constructor(private store: Store,
              private route: ActivatedRoute,
              private elRef: ElementRef) {
    route.queryParams.subscribe((it: any) => store.dispatch(new InitAction(it)));
    this.eb = new EventBus(EB_URL);
    this.eb.enableReconnect(true);
    this.eb.onreconnect = this.onreconnect;
    this.eb.onopen = () => {
      this.eb.registerHandler('mes-auto://websocket/boards/packageBox/refresh', this.refresh);
      this.eb.registerHandler('mes-auto://websocket/boards/packageBox/exceptionRecord', this.updateExceptionRecord);
      this.eb.registerHandler('mes-auto://websocket/boards/packageBox/productPlan', this.updateProductPlanRecord);
      this.eb.registerHandler('mes-auto://websocket/boards/packageBox/notification', this.updateNotification);
    };
  }

  ngOnInit(): void {
    if (environment.production) {
      setTimeout(() => this.fullScreen(), 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.eb) {
      this.eb.close();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('click')
  private fullScreen() {
    if (environment.production) {
      FULL_SCREEN(this.elRef.nativeElement);
    }
  }

  @Dispatch()
  private refresh() {
    return new RefreshAction();
  }

  @Dispatch()
  private onreconnect() {
    return new ReconnectAction();
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
    BoardPackageBoxPageComponent,
  ],
  imports: [
    NgxsModule.forFeature([BoardPackageBoxPageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: BoardPackageBoxPageComponent},
    ]),
  ],
})
export class Module {
}
