import {ChangeDetectionStrategy, Component, NgModule, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog, MatTableDataSource, PageEvent} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, takeUntil} from 'rxjs/operators';
import {isString} from 'util';
import {Batch} from '../../../models/batch';
import {PAGE_SIZE_OPTIONS, SEARCH_DEBOUNCE_TIME} from '../../../services/util.service';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {BatchManagePageState, InitAction, QueryAction, SaveAction, SetQAction} from '../../../store/batch-manage-page.state';
import {BatchUpdateDialogComponent} from './batch-update-dialog/batch-update-dialog.component';

@Component({
  templateUrl: './batch-manage-page.component.html',
  styleUrls: ['./batch-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatchManagePageComponent implements OnInit {
  readonly displayedColumns = ['workshop', 'product', 'batchNo', 'spec', 'tubeColor', 'tubeWeight', 'silkWeight', 'btns'];
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
  readonly dataSource: BatchDataSource;
  private readonly destroy$ = new Subject();

  constructor(private store: Store,
              private dialog: MatDialog) {
    this.store.dispatch(new InitAction());
    this.dataSource = new BatchDataSource(this.batches$.pipe(takeUntil(this.destroy$)));
  }

  ngOnInit(): void {
    this.batchNoQCtrl.valueChanges.pipe(
      takeUntil(this.destroy$),
      filter(it => it && isString(it) && it.trim().length > 1),
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
    ).subscribe(q => this.store.dispatch(new SetQAction(q)));
  }

  @Dispatch()
  onPageEvent(ev: PageEvent) {
    const first = ev.pageIndex * ev.pageSize;
    return new QueryAction({first, pageSize: ev.pageSize});
  }

  create() {
    this.update(new Batch());
  }

  @Dispatch()
  update(batch: Batch) {
    return BatchUpdateDialogComponent.open(this.dialog, batch).pipe(
      map(it => new SaveAction(it))
    );
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
