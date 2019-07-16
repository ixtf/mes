import {ChangeDetectionStrategy, Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {RouterModule} from '@angular/router';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {LineInputComponentModule} from '../../../components/line-input/line-input.component';
import {LineMachine} from '../../../models/line-machine';
import {SEARCH_DEBOUNCE_TIME} from '../../../services/util.service';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {InitAction, LineMachineManagePageState, QueryAction} from '../../../store/line-machine-manage-page.state';

const COLUMNS = ['line', 'item', 'spindleNum'];

@Component({
  templateUrl: './line-machine-manage-page.component.html',
  styleUrls: ['./line-machine-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineMachineManagePageComponent implements OnInit, OnDestroy {
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  readonly searchForm = this.fb.group({
    line: this.store.selectSnapshot(LineMachineManagePageState.line)
  });
  @Select(LineMachineManagePageState.lineMachines)
  readonly lineMachines$: Observable<LineMachine[]>;
  displayedColumns$: Observable<string[]>;
  private readonly destroy$ = new Subject();

  constructor(private store: Store,
              private dialog: MatDialog,
              private fb: FormBuilder) {
    this.store.dispatch(new InitAction());
  }

  ngOnInit(): void {
    this.displayedColumns$ = this.isAdmin$.pipe(
      map(it => it ? [...COLUMNS].concat(['btns']) : COLUMNS)
    );
    this.searchForm.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      filter(it => it.line),
      switchMap(it => this.store.dispatch(new QueryAction(it)))
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  create() {
    const lineMachine = new LineMachine();
    lineMachine.line = this.store.selectSnapshot(LineMachineManagePageState.line);
    this.update(lineMachine);
  }

  update(lineMachine: LineMachine) {
    // BarcodeDialogComponent.open(this.dialog, {value: 'dsfasdfa'});
    // QrcodeDialogComponent.open(this.dialog, {qrdata: 'dsfasdfa'});
  }
}

@NgModule({
  declarations: [
    LineMachineManagePageComponent,
  ],
  imports: [
    NgxsModule.forFeature([LineMachineManagePageState]),
    LineInputComponentModule,
    SharedModule,
    RouterModule.forChild([
      {path: '', component: LineMachineManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
