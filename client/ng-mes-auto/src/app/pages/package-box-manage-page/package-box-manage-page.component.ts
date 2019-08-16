import {SelectionModel} from '@angular/cdk/collections';
import {ChangeDetectionStrategy, Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog, MatTableDataSource, PageEvent} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {PackageBoxPrintComponent, PackageBoxPrintComponentModule} from '../../components/package-box-print/package-box-print.component';
import {PACKAGE_BOX_TYPE, PackageBox} from '../../models/package-box';
import {ApiService} from '../../services/api.service';
import {CodeCompare, compareWithId, COPY_WITH_CTRL, PAGE_SIZE_OPTIONS, SortByCompare} from '../../services/util.service';
import {SharedModule} from '../../shared.module';
import {AppState} from '../../store/app.state';
import {DeleteAction, InitAction, PackageBoxManagePageState, QueryAction} from '../../store/package-box-manage-page.state';

@Component({
  templateUrl: './package-box-manage-page.component.html',
  styleUrls: ['./package-box-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageBoxManagePageComponent implements OnInit, OnDestroy {
  readonly packageBoxTypes = PACKAGE_BOX_TYPE;
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  readonly copy = COPY_WITH_CTRL;
  readonly compareWithId = compareWithId;
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(PackageBoxManagePageState.packageBoxes)
  readonly packageBoxes$: Observable<PackageBox[]>;
  @Select(PackageBoxManagePageState.count)
  readonly count$: Observable<number>;
  @Select(PackageBoxManagePageState.pageIndex)
  readonly pageIndex$: Observable<number>;
  @Select(PackageBoxManagePageState.pageSize)
  readonly pageSize$: Observable<number>;
  readonly dataSource: PackageBoxDataSource;
  readonly selection = new SelectionModel<PackageBox>(true, []);
  readonly displayedColumns = ['select', 'compositeField', 'grade', 'silkCount', 'netWeight', 'grossWeight', 'budat', 'sapT001l', 'palletType', 'packageType', 'foamType', 'foamNum', 'creator', 'createDateTime', 'palletCode', 'btns'];
  readonly searchForm = this.fb.group({
    workshopId: [null, Validators.required],
    type: null,
    budatClassId: null,
    productId: null,
    gradeId: null,
    batchId: null,
    startDate: [new Date(), Validators.required],
    endDate: [new Date(), Validators.required],
  });
  readonly workshops$ = this.api.listWorkshop().pipe(map(it => (it || []).sort(CodeCompare)));
  readonly products$ = this.api.listProduct();
  readonly packageClasses$ = this.api.listPackageClass();
  readonly grades$ = this.api.listGrade().pipe(map(it => (it || []).sort(SortByCompare)));
  private readonly destroy$ = new Subject();

  constructor(private store: Store,
              private fb: FormBuilder,
              private api: ApiService,
              private dialog: MatDialog) {
    this.store.dispatch(new InitAction());
    this.dataSource = new PackageBoxDataSource(this.packageBoxes$.pipe(takeUntil(this.destroy$)));
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @Dispatch()
  onPageEvent(ev: PageEvent) {
    const first = ev.pageIndex * ev.pageSize;
    const payload = Object.assign(this.searchForm.value, {first, pageSize: ev.pageSize});
    return new QueryAction(payload);
  }

  @Dispatch()
  query() {
    const payload = Object.assign(this.searchForm.value, {first: 0});
    return new QueryAction(payload);
  }

  @Dispatch()
  delete(packageBox: PackageBox) {
    return new DeleteAction(packageBox);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  print() {
    PackageBoxPrintComponent.print(this.dialog, this.selection.selected);
  }

  batchTooltip(packageBox: PackageBox) {
    return `${packageBox.batch.product.name} — ${packageBox.batch.spec} — ${packageBox.batch.tubeColor}`;
  }
}

class PackageBoxDataSource extends MatTableDataSource<PackageBox> {
  private readonly subject = new BehaviorSubject<PackageBox[]>([]);

  constructor(private packageBoxes$: Observable<PackageBox[]>) {
    super();
    packageBoxes$.subscribe(it => this.subject.next(it || []));
  }

  get data(): PackageBox[] {
    return this.subject.value;
  }

  connect(): BehaviorSubject<PackageBox[]> {
    return this.subject;
  }
}

@NgModule({
  declarations: [
    PackageBoxManagePageComponent,
  ],
  imports: [
    NgxsModule.forFeature([PackageBoxManagePageState]),
    SharedModule,
    PackageBoxPrintComponentModule,
    RouterModule.forChild([
      {path: '', component: PackageBoxManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
