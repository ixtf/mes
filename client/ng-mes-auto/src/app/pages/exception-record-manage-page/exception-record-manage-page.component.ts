import {ChangeDetectionStrategy, Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {combineLatest, Observable, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {LineMachineInputComponentModule} from '../../components/line-machine-input/line-machine-input.component';
import {ExceptionRecord} from '../../models/exception-record';
import {Line} from '../../models/line';
import {ApiService} from '../../services/api.service';
import {SharedModule} from '../../shared.module';
import {AppState} from '../../store/app.state';
import {ExceptionRecordManagePageState, FilterLineAction, HandleAction, InitAction, SaveAction} from '../../store/exception-record-manage-page.state';
// @ts-ignore
import {ExceptionRecordUpdateDialogComponent} from './exception-record-update-dialog/exception-record-update-dialog.component';

@Component({
  templateUrl: './exception-record-manage-page.component.html',
  styleUrls: ['./exception-record-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExceptionRecordManagePageComponent implements OnInit, OnDestroy {
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(AppState.authInfoId)
  readonly authInfoId$: Observable<string>;
  @Select(ExceptionRecordManagePageState.filterLine)
  readonly filterLine$: Observable<Line>;
  @Select(ExceptionRecordManagePageState.lines)
  readonly lines$: Observable<Line[]>;
  @Select(ExceptionRecordManagePageState.exceptionRecords)
  readonly exceptionRecords$: Observable<ExceptionRecord[]>;
  readonly displayedColumns = ['spec', 'doffingNum', 'exception', 'creator', 'createDateTime', 'btns'];
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

  @Dispatch()
  handle(exceptionRecord: ExceptionRecord) {
    return new HandleAction(exceptionRecord);
  }

  @Dispatch()
  filterLine(line?: Line) {
    return new FilterLineAction(line);
  }

  create() {
    this.update(new ExceptionRecord());
  }

  @Dispatch()
  update(exceptionRecord: ExceptionRecord) {
    return ExceptionRecordUpdateDialogComponent.open(this.dialog, exceptionRecord).afterClosed().pipe(
      filter(it => !!it),
      map(it => new SaveAction(it))
    );
  }

  delete(exceptionRecord: ExceptionRecord) {
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
    ExceptionRecordManagePageComponent,
    ExceptionRecordUpdateDialogComponent,
  ],
  entryComponents: [
    ExceptionRecordUpdateDialogComponent
  ],
  imports: [
    NgxsModule.forFeature([ExceptionRecordManagePageState]),
    SharedModule,
    LineMachineInputComponentModule,
    RouterModule.forChild([
      {path: '', component: ExceptionRecordManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
