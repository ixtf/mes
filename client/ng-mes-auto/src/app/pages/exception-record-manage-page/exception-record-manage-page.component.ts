import {ChangeDetectionStrategy, Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable, Subject} from 'rxjs';
import {ExceptionRecord} from '../../models/exception-record';
import {ApiService} from '../../services/api.service';
import {PAGE_SIZE_OPTIONS} from '../../services/util.service';
import {SharedModule} from '../../shared.module';
import {AppState} from '../../store/app.state';
import {ExceptionRecordManagePageState, HandleAction, InitAction} from '../../store/exception-record-manage-page.state';
// @ts-ignore
import {ExceptionRecordUpdateDialogComponent} from './exception-record-update-dialog/exception-record-update-dialog.component';

@Component({
  templateUrl: './exception-record-manage-page.component.html',
  styleUrls: ['./exception-record-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExceptionRecordManagePageComponent implements OnInit, OnDestroy {
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  @Select(AppState.isAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(ExceptionRecordManagePageState.exceptionRecords)
  readonly exceptionRecords$: Observable<ExceptionRecord[]>;
  readonly displayedColumns = ['spec', 'doffingNum', 'exception', 'creator', 'createDateTime', 'btns'];
  private readonly destroy$ = new Subject();

  constructor(private store: Store,
              private fb: FormBuilder,
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

  create() {
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
    RouterModule.forChild([
      {path: '', component: ExceptionRecordManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
