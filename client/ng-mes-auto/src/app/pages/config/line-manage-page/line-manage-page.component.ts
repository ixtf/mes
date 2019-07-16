import {ChangeDetectionStrategy, Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {RouterModule} from '@angular/router';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {Line} from '../../../models/line';
import {Workshop} from '../../../models/workshop';
import {SEARCH_DEBOUNCE_TIME} from '../../../services/util.service';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {InitAction, LineManagePageState, QueryAction} from '../../../store/line-manage-page.state';

const COLUMNS = ['workshop', 'name', 'doffingType'];

@Component({
  templateUrl: './line-manage-page.component.html',
  styleUrls: ['./line-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineManagePageComponent implements OnInit, OnDestroy {
  @Select(LineManagePageState.workshopId)
  readonly workshopId$: Observable<string>;
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  readonly searchForm = this.fb.group({
    workshopId: null
  });
  @Select(LineManagePageState.workshops)
  readonly workshops$: Observable<Workshop[]>;
  @Select(LineManagePageState.lines)
  readonly lines$: Observable<Line[]>;
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
    this.workshopId$.pipe(
      takeUntil(this.destroy$),
      tap(workshopId => this.searchForm.patchValue({workshopId}, {emitEvent: false}))
    ).subscribe();
    this.searchForm.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      switchMap(it => this.store.dispatch(new QueryAction(it)))
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  create() {
    // this.update(null);
  }

  update(id: string) {
    // BarcodeDialogComponent.open(this.dialog, {value: 'dsfasdfa'});
    // QrcodeDialogComponent.open(this.dialog, {qrdata: 'dsfasdfa'});
  }
}

@NgModule({
  declarations: [
    LineManagePageComponent,
  ],
  imports: [
    NgxsModule.forFeature([LineManagePageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: LineManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
