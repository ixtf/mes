import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog, MatTableDataSource, PageEvent} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {BehaviorSubject, Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap, tap} from 'rxjs/operators';
import {Batch} from '../../../models/batch';
import {PAGE_SIZE_OPTIONS, SEARCH_DEBOUNCE_TIME, UtilService} from '../../../services/util.service';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {BatchManagePageState, InitAction, QueryAction, SaveAction} from '../../../store/batch-manage-page.state';
import {BatchUpdateDialogComponent} from './batch-update-dialog/batch-update-dialog.component';

@Component({
  templateUrl: './batch-manage-page.component.html',
  styleUrls: ['./batch-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatchManagePageComponent {
  readonly displayedColumns = ['workshop', 'product', 'batchNo', 'spec', 'silkWeight', 'tubeColor', 'tubeWeight', 'btns'];
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(BatchManagePageState.batches)
  readonly batches$: Observable<Batch[]>;
  @Select(BatchManagePageState.count)
  readonly count$: Observable<number>;
  @Select(BatchManagePageState.pageIndex)
  readonly pageIndex$: Observable<number>;
  @Select(BatchManagePageState.pageSize)
  readonly pageSize$: Observable<number>;
  readonly batchNoQCtrl = new FormControl();
  readonly dataSource = new BatchDataSource(this.batches$);

  constructor(private store: Store,
              private dialog: MatDialog,
              private util: UtilService) {
    this.store.dispatch(new InitAction());
    this.batchNoQCtrl.valueChanges.pipe(
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      tap(q => {
        const pageSize = this.store.selectSnapshot(BatchManagePageState.pageSize);
        this.store.dispatch(new QueryAction({pageSize, q}));
      }),
    ).subscribe();
  }

  @Dispatch()
  onPageEvent(ev: PageEvent) {
    const first = ev.pageIndex * ev.pageSize;
    return new QueryAction({first, pageSize: ev.pageSize});
  }

  create() {
    this.update(new Batch());
  }

  update(batch: Batch) {
    return BatchUpdateDialogComponent.open(this.dialog, batch).pipe(
      switchMap(it => this.store.dispatch(new SaveAction(it))),
      tap(() => this.util.showSuccess()),
    ).subscribe();
  }
}

class BatchDataSource extends MatTableDataSource<Batch> {
  private readonly subject = new BehaviorSubject<Batch[]>([]);

  constructor(data$: Observable<Batch[]>) {
    super();
    data$.subscribe(it => this.subject.next(it || []));
  }

  get data(): Batch[] {
    return this.subject.value;
  }

  connect(): BehaviorSubject<Batch[]> {
    return this.subject;
  }
}

@NgModule({
  declarations: [
    BatchManagePageComponent,
    BatchUpdateDialogComponent,
  ],
  entryComponents: [
    BatchUpdateDialogComponent,
  ],
  imports: [
    NgxsModule.forFeature([BatchManagePageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: BatchManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
