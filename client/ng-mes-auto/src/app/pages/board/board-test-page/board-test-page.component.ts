import {ChangeDetectionStrategy, Component, HostBinding, NgModule, OnDestroy, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {INTERVAL$} from '../../../services/util.service';
import {SharedModule} from '../../../shared.module';
import {RefreshAction} from '../board-abnormal-page/board-abnormal-page.state';

@Component({
  templateUrl: './board-test-page.component.html',
  styleUrls: ['./board-test-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardTestPageComponent implements OnInit, OnDestroy {
  @HostBinding('class.board-page')
  private readonly b = true;
  private readonly destroy$ = new Subject();
  readonly currentDateTime$ = INTERVAL$.pipe(
    takeUntil(this.destroy$),
    map(() => new Date()),
  );

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @Dispatch()
  private refresh() {
    return new RefreshAction();
  }

}

@NgModule({
  declarations: [
    BoardTestPageComponent,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {path: '', component: BoardTestPageComponent},
    ]),
  ],
})
export class Module {
}
