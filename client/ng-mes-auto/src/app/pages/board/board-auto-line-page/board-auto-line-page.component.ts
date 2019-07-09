import {ChangeDetectionStrategy, Component, ElementRef, HostBinding, NgModule, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {interval, Observable, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {EB_URL, environment} from '../../../../environments/environment';
import {FULL_SCREEN} from '../../../services/util.service';
import {SharedModule} from '../../../shared.module';
import {BoardAutoLinePageState, InitAction, MessageModel, ReceivedMessageAction} from '../../../store/board-auto-line-page.state';

declare const EventBus: any;

@Component({
  templateUrl: './board-auto-line-page.component.html',
  styleUrls: ['./board-auto-line-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardAutoLinePageComponent implements OnInit, OnDestroy {
  @HostBinding('class.board-page')
  readonly b = true;
  @Select(BoardAutoLinePageState.messages)
  readonly messages$: Observable<MessageModel[]>;
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
    this.eb.onopen = () => {
      this.eb.registerHandler('mes-auto://websocket/boards/RiambSilkCarInfoFetchReasons', (error, message) => {
        const msg = JSON.parse(message.body);
        this.store.dispatch(new ReceivedMessageAction(msg));
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

  fullScreen() {
    FULL_SCREEN(this.elRef.nativeElement);
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
