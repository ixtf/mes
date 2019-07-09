import {ChangeDetectionStrategy, Component, ElementRef, HostBinding, HostListener, NgModule, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {interval, Observable, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {EB_URL, environment} from '../../../../environments/environment';
import {ExceptionRecord} from '../../../models/exception-record';
import {Notification} from '../../../models/notification';
import {Item} from '../../../models/workshop-product-plan-report';
import {FULL_SCREEN} from '../../../services/util.service';
import {SharedModule} from '../../../shared.module';
import {BoardAbnormalPageState, InitAction, UpdateExceptionRecordAction, UpdateNotificationAction, UpdateProductPlanRecordAction} from '../../../store/board-abnormal-page.state';

declare const EventBus: any;

@Component({
  templateUrl: './board-abnormal-page.component.html',
  styleUrls: ['./board-abnormal-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardAbnormalPageComponent implements OnInit, OnDestroy {
  @Select(BoardAbnormalPageState.productPlanItems)
  readonly productPlanItems$: Observable<Item[]>;
  @HostBinding('class.board-page')
  readonly b = true;
  @Select(BoardAbnormalPageState.exceptionRecords)
  readonly exceptionRecords$: Observable<ExceptionRecord[]>;
  @Select(BoardAbnormalPageState.notifications)
  readonly notifications$: Observable<Notification[]>;
  private readonly destroy$ = new Subject();
  readonly currentDateTime$ = interval(1000).pipe(
    takeUntil(this.destroy$),
    map(() => new Date())
  );
  private readonly eb;

  constructor(private store: Store,
              private route: ActivatedRoute,
              private elRef: ElementRef) {
    route.queryParams.subscribe((it: any) => this.store.dispatch(new InitAction(it)));
    this.eb = new EventBus(EB_URL);
    this.eb.enableReconnect(true);
    this.eb.onreconnect = () => setTimeout(() => location.reload(), 10 * 1000);
    this.eb.onopen = () => {
      this.eb.registerHandler('mes-auto://websocket/boards/abnormal/refresh', () => location.reload());
      this.eb.registerHandler('mes-auto://websocket/boards/abnormal/exceptionRecord', (error, message) => {
        const exceptionRecord = JSON.parse(message.body);
        this.store.dispatch(new UpdateExceptionRecordAction({exceptionRecord}));
      });
      this.eb.registerHandler('mes-auto://websocket/boards/abnormal/productPlan', (error, message) => {
        const lineMachineProductPlan = JSON.parse(message.body);
        this.store.dispatch(new UpdateProductPlanRecordAction({lineMachineProductPlan}));
      });
      this.eb.registerHandler('mes-auto://websocket/boards/abnormal/notification', (error, message) => {
        const notification = JSON.parse(message.body);
        this.store.dispatch(new UpdateNotificationAction({notification}));
      });
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
    FULL_SCREEN(this.elRef.nativeElement);
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
