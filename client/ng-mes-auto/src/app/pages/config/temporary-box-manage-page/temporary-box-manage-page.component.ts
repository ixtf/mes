import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatDialog, MatTableDataSource, PageEvent} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {BehaviorSubject, Observable} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {BatchInputComponentModule} from '../../../components/batch-input/batch-input.component';
import {TemporaryBox} from '../../../models/temporary-box';
import {PAGE_SIZE_OPTIONS, UtilService} from '../../../services/util.service';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {InitAction, QueryAction, SaveAction, TemporaryBoxManagePageState} from '../../../store/temporary-box-manage-page.state';
import {TemporaryBoxUpdateDialogComponent} from './temporary-box-update-dialog/temporary-box-update-dialog.component';

@Component({
  templateUrl: './temporary-box-manage-page.component.html',
  styleUrls: ['./temporary-box-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemporaryBoxManagePageComponent {
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(TemporaryBoxManagePageState.temporaryBoxes)
  readonly temporaryBoxes$: Observable<TemporaryBox[]>;
  @Select(TemporaryBoxManagePageState.count)
  readonly count$: Observable<number>;
  @Select(TemporaryBoxManagePageState.pageIndex)
  readonly pageIndex$: Observable<number>;
  @Select(TemporaryBoxManagePageState.pageSize)
  readonly pageSize$: Observable<number>;
  readonly displayedColumns = ['code', 'batch', 'grade', 'count', 'btns'];
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  readonly dataSource = new TemporaryBoxDataSource(this.temporaryBoxes$);
  readonly batchCtrl = new FormControl();

  constructor(private store: Store,
              private util: UtilService,
              private dialog: MatDialog) {
    this.store.dispatch(new InitAction());
    this.batchCtrl.valueChanges.subscribe(it => {
      console.log(it);
    });
  }

  @Dispatch()
  onPageEvent(ev: PageEvent) {
    const first = ev.pageIndex * ev.pageSize;
    return new QueryAction({first, pageSize: ev.pageSize});
  }

  create() {
    this.update(new TemporaryBox());
  }

  update(temporaryBox: TemporaryBox) {
    return TemporaryBoxUpdateDialogComponent.open(this.dialog, temporaryBox).pipe(
      switchMap(it => this.store.dispatch(new SaveAction(it))),
      tap(() => this.util.showSuccess()),
    );
  }

  query(ev: MatAutocompleteSelectedEvent) {
    console.log(ev);
  }
}

class TemporaryBoxDataSource extends MatTableDataSource<TemporaryBox> {
  private readonly subject = new BehaviorSubject<TemporaryBox[]>([]);

  constructor(data$: Observable<TemporaryBox[]>) {
    super();
    data$.subscribe(it => this.subject.next(it || []));
  }

  get data(): TemporaryBox[] {
    return this.subject.value;
  }

  connect(): BehaviorSubject<TemporaryBox[]> {
    return this.subject;
  }
}

@NgModule({
  declarations: [
    TemporaryBoxManagePageComponent,
    TemporaryBoxUpdateDialogComponent,
  ],
  entryComponents: [
    TemporaryBoxUpdateDialogComponent,
  ],
  imports: [
    NgxsModule.forFeature([TemporaryBoxManagePageState]),
    SharedModule,
    BatchInputComponentModule,
    RouterModule.forChild([
      {path: '', component: TemporaryBoxManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
