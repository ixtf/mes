import {ChangeDetectionStrategy, Component, HostBinding, NgModule, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {EB_URL} from '../../../../environments/environment';
import {INTERVAL$} from '../../../services/util.service';
import {SharedModule} from '../../../shared.module';
import {BoardSilkCarRuntimePageState, GroupByBatchGradeItem, InitAction, SilkCarRuntimeReportItem, UpdateSilkCarRuntimeEvent} from '../../../store/board-silk-car-runtime-page.state';

declare const EventBus: any;

@Component({
  templateUrl: './board-silk-car-runtime-page.component.html',
  styleUrls: ['./board-silk-car-runtime-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardSilkCarRuntimePageComponent implements OnInit, OnDestroy {
  @Select(BoardSilkCarRuntimePageState.allItems)
  readonly allItems$: Observable<SilkCarRuntimeReportItem[]>;
  @Select(BoardSilkCarRuntimePageState.timeOutSilkCarRuntimes)
  readonly timeOutItems$: Observable<SilkCarRuntimeReportItem[]>;
  @Select(BoardSilkCarRuntimePageState.groupByBatchGradeItems)
  readonly groupByBatchGradeItems$: Observable<GroupByBatchGradeItem[]>;
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
      this.eb.registerHandler('mes-auto://websocket/boards/silkCarRuntimeReport/refresh', this.refresh);
      this.eb.registerHandler('mes-auto://websocket/boards/silkCarRuntimeReport/events', this.updateSilkCarRuntimeEvent);
    };
  }

  ngOnInit(): void {
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

  // @Dispatch()
  // private refresh() {
  //   return new RefreshAction();
  // }
  //
  // @Dispatch()
  // private onreconnect() {
  //   return setTimeout(() => location.reload(), 30 * 1000);
  // }

  @Dispatch()
  private updateSilkCarRuntimeEvent(error, message) {
    return new UpdateSilkCarRuntimeEvent(JSON.parse(message.body));
  }

}

@NgModule({
  declarations: [
    BoardSilkCarRuntimePageComponent,
  ],
  imports: [
    NgxsModule.forFeature([BoardSilkCarRuntimePageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: BoardSilkCarRuntimePageComponent},
    ]),
  ],
})
export class Module {
}
