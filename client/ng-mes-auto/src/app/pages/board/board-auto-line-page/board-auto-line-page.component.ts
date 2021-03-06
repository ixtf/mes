import {ChangeDetectionStrategy, Component, HostBinding, NgModule, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {EB_URL} from '../../../../environments/environment';
import {INTERVAL$} from '../../../services/util.service';
import {SharedModule} from '../../../shared.module';
import {BoardAutoLinePageState, InitAction, MessageModel, ReceivedMessageAction} from '../../../store/board-auto-line-page.state';

declare const EventBus: any;

@Component({
  templateUrl: './board-auto-line-page.component.html',
  styleUrls: ['./board-auto-line-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardAutoLinePageComponent implements OnInit, OnDestroy {
  @Select(BoardAutoLinePageState.messages)
  readonly messages$: Observable<MessageModel[]>;
  private readonly destroy$ = new Subject();
  readonly currentDateTime$ = INTERVAL$.pipe(
    takeUntil(this.destroy$),
    map(() => new Date()),
  );
  @HostBinding('class.board-page')
  private readonly b = true;
  private readonly eb;

  constructor(private store: Store,
              private route: ActivatedRoute) {
    route.queryParams.subscribe((it: any) => this.store.dispatch(new InitAction(it)));
    this.eb = new EventBus(EB_URL);
    this.eb.enableReconnect(true);
    this.eb.onopen = () => {
      this.eb.registerHandler('mes-auto://websocket/boards/RiambSilkCarInfoFetchReasons', this.updateReceivedMessage);
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

  @Dispatch()
  private updateReceivedMessage(error, message) {
    const msg = JSON.parse(message.body);
    return new ReceivedMessageAction(msg);
  }

}

@NgModule({
  declarations: [
    BoardAutoLinePageComponent,
  ],
  imports: [
    NgxsModule.forFeature([BoardAutoLinePageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: BoardAutoLinePageComponent},
    ]),
  ],
})
export class Module {
}
