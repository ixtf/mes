import {SelectionModel} from '@angular/cdk/collections';
import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {MatDialog, MatSnackBar, MatTableDataSource} from '@angular/material';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {BehaviorSubject, Observable} from 'rxjs';
import {fromArray} from 'rxjs/internal/observable/fromArray';
import {concatMap, filter, switchMap, tap, toArray} from 'rxjs/operators';
import {BatchInputComponentModule} from '../../components/batch-input/batch-input.component';
import {PackageBoxDetailDialogPageComponent, PackageBoxDetailDialogPageComponentModule} from '../../components/package-box-detail-dialog-page/package-box-detail-dialog-page.component';
import {PackageBoxPrintComponent, PackageBoxPrintComponentModule} from '../../components/package-box-print/package-box-print.component';
import {AuthInfo} from '../../models/auth-info';
import {Batch} from '../../models/batch';
import {Grade} from '../../models/grade';
import {PackageBox} from '../../models/package-box';
import {PackageClass} from '../../models/package-class';
import {ApiService} from '../../services/api.service';
import {COMPARE_WITH_ID, COPY_WITH_CTRL, UtilService} from '../../services/util.service';
import {SharedModule} from '../../shared.module';
import {AppState, ShowErrorAction} from '../app/app.state';
import {PackageBoxBatchMeasureDialogComponent} from './package-box-batch-measure-dialog/package-box-batch-measure-dialog.component';
import {PackageBoxCreateDialogComponent} from './package-box-create-dialog/package-box-create-dialog.component';
import {PackageBoxMeasureDialogComponent} from './package-box-measure-dialog/package-box-measure-dialog.component';
import {InitAction, MeasureAction, RefreshAction, SaveAction, SetFilterAction, UnbudatPackageBoxManagePageState} from './unbudat-package-box-manage-page.state';

@Component({
  templateUrl: './unbudat-package-box-manage-page.component.html',
  styleUrls: ['./unbudat-package-box-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnbudatPackageBoxManagePageComponent {
  readonly copy = COPY_WITH_CTRL;
  readonly compareWithId = COMPARE_WITH_ID;
  readonly displayedColumns = ['select', 'compositeField', 'grade', 'silkCount', 'netWeight', 'grossWeight', 'budat', 'sapT001l', 'palletType', 'packageType', 'foamType', 'foamNum', 'creator', 'createDateTime', 'palletCode', 'btns'];
  @Select(AppState.authInfo)
  readonly authInfo$: Observable<AuthInfo>;
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(UnbudatPackageBoxManagePageState.budat)
  readonly budat$: Observable<Date>;
  @Select(UnbudatPackageBoxManagePageState.budatClass)
  readonly budatClass$: Observable<PackageClass>;
  @Select(UnbudatPackageBoxManagePageState.batches)
  readonly batches$: Observable<Batch[]>;
  @Select(UnbudatPackageBoxManagePageState.grades)
  readonly grades$: Observable<Grade[]>;
  @Select(UnbudatPackageBoxManagePageState.packageBoxes)
  readonly packageBoxes$: Observable<PackageBox[]>;
  readonly dataSource = new PackageBoxDataSource(this.packageBoxes$);
  readonly filterForm = this.fb.group({
    batchId: null,
    gradeId: null,
    printed: null,
    measured: null,
  });
  readonly selection = new SelectionModel<PackageBox>(true, []);

  constructor(private store: Store,
              private fb: FormBuilder,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private translate: TranslateService,
              private api: ApiService,
              private util: UtilService) {
    route.queryParams.subscribe((it: any) => store.dispatch(new InitAction(it)));
    this.filterForm.valueChanges.subscribe(it => {
      this.selection.clear();
      this.store.dispatch(new SetFilterAction(it));
    });
  }

  get canBatchMeasure(): boolean {
    return PackageBoxBatchMeasureDialogComponent.check(this.selection.selected);
  }

  @Dispatch()
  refresh() {
    return new RefreshAction();
  }

  resetFilter() {
    this.filterForm.setValue({
      batchId: null,
      gradeId: null,
      printed: null,
      measured: null,
    });
  }

  create() {
    const workshop = this.store.selectSnapshot(UnbudatPackageBoxManagePageState.workshop);
    const packageBox = new PackageBox();
    packageBox.budat = this.store.selectSnapshot(UnbudatPackageBoxManagePageState.budat);
    packageBox.budatClass = this.store.selectSnapshot(UnbudatPackageBoxManagePageState.budatClass);
    PackageBoxCreateDialogComponent.open(this.dialog, {workshop, packageBox}).pipe(
      switchMap(it => this.store.dispatch(new SaveAction(it))),
    ).subscribe(() => {
      this.util.showSuccess();
    }, error => {
      this.store.dispatch(new ShowErrorAction({error}));
    });
  }

  measure(packageBox: PackageBox) {
    const workshop = this.store.selectSnapshot(UnbudatPackageBoxManagePageState.workshop);
    if (!packageBox.budat) {
      packageBox.budat = this.store.selectSnapshot(UnbudatPackageBoxManagePageState.budat);
      packageBox.budatClass = this.store.selectSnapshot(UnbudatPackageBoxManagePageState.budatClass);
    }
    PackageBoxMeasureDialogComponent.open(this.dialog, {workshop, packageBox}).pipe(
      switchMap(it => this.store.dispatch(new MeasureAction(it))),
    ).subscribe(() => {
      this.util.showSuccess();
    }, error => {
      this.store.dispatch(new ShowErrorAction({error}));
    });
  }

  batchMeasure() {
    const workshop = this.store.selectSnapshot(UnbudatPackageBoxManagePageState.workshop);
    const budat = this.store.selectSnapshot(UnbudatPackageBoxManagePageState.budat);
    const budatClass = this.store.selectSnapshot(UnbudatPackageBoxManagePageState.budatClass);
    const packageBoxes = this.selection.selected;
    PackageBoxBatchMeasureDialogComponent.open(this.dialog, {workshop, budat, budatClass, packageBoxes}).pipe(
      switchMap(it => fromArray(it || [])),
      concatMap(it => this.store.dispatch(new MeasureAction(it))),
      toArray(),
      filter(it => it && it.length > 0),
      tap(() => this.util.showSuccess()),
    ).subscribe(() => {
      this.util.showSuccess();
    }, error => {
      this.store.dispatch(new ShowErrorAction({error}));
    });
  }

  print(packageBox?: PackageBox) {
    PackageBoxPrintComponent.print(this.dialog, packageBox || this.selection.selected);
  }

  detail(packageBox: PackageBox) {
    PackageBoxDetailDialogPageComponent.open(this.dialog, packageBox);
  }

  isValidPalletCode(packageBox: PackageBox): boolean {
    return PackageBox.isValidPalletCode(packageBox.palletCode);
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

  trClass(packageBox: PackageBox): string {
    if (packageBox.printCount > 0) {
      return 'dd';
    }
    if (packageBox.budat) {

    }
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
    UnbudatPackageBoxManagePageComponent,
    PackageBoxCreateDialogComponent,
    PackageBoxMeasureDialogComponent,
    PackageBoxBatchMeasureDialogComponent,
  ],
  entryComponents: [
    PackageBoxCreateDialogComponent,
    PackageBoxMeasureDialogComponent,
    PackageBoxBatchMeasureDialogComponent,
  ],
  imports: [
    NgxsModule.forFeature([UnbudatPackageBoxManagePageState]),
    SharedModule,
    BatchInputComponentModule,
    PackageBoxDetailDialogPageComponentModule,
    PackageBoxPrintComponentModule,
    RouterModule.forChild([
      {path: '', component: UnbudatPackageBoxManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
