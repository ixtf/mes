import {SelectionModel} from '@angular/cdk/collections';
import {ChangeDetectionStrategy, Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog, MatTableDataSource} from '@angular/material';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {PackageBoxPrintComponent, PackageBoxPrintComponentModule} from '../../components/package-box-print/package-box-print.component';
import {AuthInfo} from '../../models/auth-info';
import {Batch} from '../../models/batch';
import {Grade} from '../../models/grade';
import {PackageBox} from '../../models/package-box';
import {PackageClass} from '../../models/package-class';
import {ApiService} from '../../services/api.service';
import {CodeCompare, COPY} from '../../services/util.service';
import {SharedModule} from '../../shared.module';
import {AppState} from '../../store/app.state';
import {FilterBatchAction, FilterGradeAction, InitAction, UnbudatPackageBoxManagePageState} from '../../store/unbudat-package-box-manage-page.state';
import {PackageBoxUpdateDialogComponent} from './package-box-update-dialog/package-box-update-dialog.component';

@Component({
  templateUrl: './unbudat-package-box-manage-page.component.html',
  styleUrls: ['./unbudat-package-box-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnbudatPackageBoxManagePageComponent implements OnInit, OnDestroy {
  @Select(AppState.authInfo)
  readonly authInfo$: Observable<AuthInfo>;
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(UnbudatPackageBoxManagePageState.budat)
  readonly budat$: Observable<Date>;
  @Select(UnbudatPackageBoxManagePageState.budatClass)
  readonly budatClass$: Observable<PackageClass>;
  @Select(UnbudatPackageBoxManagePageState.filterBatch)
  readonly filterBatch$: Observable<Batch>;
  @Select(UnbudatPackageBoxManagePageState.batches)
  readonly batches$: Observable<Batch[]>;
  @Select(UnbudatPackageBoxManagePageState.filterGrade)
  readonly filterGrade$: Observable<Grade>;
  @Select(UnbudatPackageBoxManagePageState.grades)
  readonly grades$: Observable<Grade[]>;
  @Select(UnbudatPackageBoxManagePageState.packageBoxes)
  readonly packageBoxes$: Observable<PackageBox[]>;
  readonly dataSource: PackageBoxDataSource;
  readonly displayedColumns = ['select', 'test', 'grade', 'silkCount', 'netWeight', 'grossWeight', 'sapT001l', 'budat', 'palletType', 'packageType', 'foamType', 'foamNum', 'creator', 'createDateTime', 'palletCode', 'btns'];
  readonly searchForm = this.fb.group({
    workshopId: [null, Validators.required],
    date: [new Date(), Validators.required],
  });
  readonly workshops$ = this.api.listWorkshop().pipe(map(it => (it || []).sort(CodeCompare)));
  readonly selection = new SelectionModel<PackageBox>(true, []);
  private readonly destroy$ = new Subject();

  constructor(private store: Store,
              private fb: FormBuilder,
              private route: ActivatedRoute,
              private api: ApiService,
              private dialog: MatDialog) {
    route.queryParams.subscribe((it: any) => store.dispatch(new InitAction(it)));
    this.dataSource = new PackageBoxDataSource(this.packageBoxes$.pipe(takeUntil(this.destroy$)));
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @Dispatch()
  filterBatch(batch?: Batch) {
    this.selection.clear();
    return new FilterBatchAction(batch);
  }

  @Dispatch()
  filterGrade(grade?: Grade) {
    this.selection.clear();
    return new FilterGradeAction(grade);
  }

  detail(packageBox: PackageBox) {

  }

  create() {
    this.api.getPackageBox('5d19a8a46dedd800019a6c8b').subscribe(it => {
      PackageBoxPrintComponent.print(this.dialog, [it, it]);
    });
    // this.update(new PackageBox());
  }

  @Dispatch()
  update(packageBox: PackageBox) {
    // return PackageBoxUpdateDialogComponent.open(this.dialog, packageBox).afterClosed().pipe(
    //   filter(it => !!it),
    //   map(it => new SaveAction(it))
    // );
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

  batchMeasure() {

  }

  print() {
    PackageBoxPrintComponent.print(this.dialog, this.selection.selected);
  }

  canBatchMeasure(): boolean {
    return false;
  }

  filterPrinted() {

  }

  filterMeasured() {

  }

  copyCode(code: string, ev: MouseEvent) {
    COPY(code);
  }

  resetFilter() {

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
    UnbudatPackageBoxManagePageComponent,
    PackageBoxUpdateDialogComponent,
  ],
  entryComponents: [
    PackageBoxUpdateDialogComponent
  ],
  imports: [
    NgxsModule.forFeature([UnbudatPackageBoxManagePageState]),
    SharedModule,
    PackageBoxPrintComponentModule,
    RouterModule.forChild([
      {path: '', component: UnbudatPackageBoxManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
