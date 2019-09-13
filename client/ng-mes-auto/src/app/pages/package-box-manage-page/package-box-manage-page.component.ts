import {SelectionModel} from '@angular/cdk/collections';
import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog, MatTableDataSource, PageEvent} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {BehaviorSubject, Observable} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {BatchInputComponentModule} from '../../components/batch-input/batch-input.component';
import {ConfirmDialogComponent} from '../../components/confirm-dialog/confirm-dialog.component';
import {PackageBoxDetailDialogPageComponent, PackageBoxDetailDialogPageComponentModule} from '../../components/package-box-detail-dialog-page/package-box-detail-dialog-page.component';
import {PackageBoxPrintComponent, PackageBoxPrintComponentModule} from '../../components/package-box-print/package-box-print.component';
import {PACKAGE_BOX_TYPE, PackageBox} from '../../models/package-box';
import {COMPARE_WITH_ID, COPY_WITH_CTRL, PAGE_SIZE_OPTIONS, UtilService} from '../../services/util.service';
import {SharedModule} from '../../shared.module';
import {AppState} from '../../store/app.state';
import {DeleteAction, InitAction, PackageBoxManagePageState, QueryAction} from '../../store/package-box-manage-page.state';

@Component({
  templateUrl: './package-box-manage-page.component.html',
  styleUrls: ['./package-box-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageBoxManagePageComponent {
  readonly packageBoxTypes = PACKAGE_BOX_TYPE;
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  readonly copy = COPY_WITH_CTRL;
  readonly compareWithId = COMPARE_WITH_ID;
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(PackageBoxManagePageState.workshops)
  readonly workshops$;
  @Select(PackageBoxManagePageState.products)
  readonly products$;
  @Select(PackageBoxManagePageState.grades)
  readonly grades$;
  @Select(PackageBoxManagePageState.packageClasses)
  readonly packageClasses$;
  @Select(PackageBoxManagePageState.packageBoxes)
  readonly packageBoxes$: Observable<PackageBox[]>;
  @Select(PackageBoxManagePageState.count)
  readonly count$: Observable<number>;
  @Select(PackageBoxManagePageState.pageIndex)
  readonly pageIndex$: Observable<number>;
  @Select(PackageBoxManagePageState.pageSize)
  readonly pageSize$: Observable<number>;
  readonly dataSource = new PackageBoxDataSource(this.packageBoxes$);
  readonly selection = new SelectionModel<PackageBox>(true, []);
  // readonly displayedColumns = ['select', 'compositeField', 'grade', 'silkCount', 'netWeight', 'grossWeight', 'budat', 'sapT001l', 'palletType', 'packageType', 'foamType', 'foamNum', 'creator', 'createDateTime', 'palletCode', 'btns'];
  readonly displayedColumns = ['compositeField', 'grade', 'silkCount', 'netWeight', 'grossWeight', 'budat', 'sapT001l', 'palletType', 'packageType', 'foamType', 'foamNum', 'creator', 'createDateTime', 'palletCode', 'btns'];
  readonly searchForm = this.fb.group({
    workshopId: [this.store.selectSnapshot(PackageBoxManagePageState.workshopId), Validators.required],
    type: null,
    budatClassId: null,
    productId: null,
    gradeId: null,
    batch: null,
    code: null,
    startDate: [new Date(), Validators.required],
    endDate: [new Date(), Validators.required],
  });

  constructor(private store: Store,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private util: UtilService) {
    this.store.dispatch(new InitAction());
  }

  @Dispatch()
  onPageEvent(ev: PageEvent) {
    const first = ev.pageIndex * ev.pageSize;
    const payload = Object.assign(this.searchForm.value, {first, pageSize: ev.pageSize});
    return new QueryAction(payload);
  }

  @Dispatch()
  query() {
    const payload = Object.assign({}, this.searchForm.value, {first: 0});
    payload.batchId = payload.batch && payload.batch.id;
    return new QueryAction(payload);
  }

  delete(packageBox: PackageBox) {
    ConfirmDialogComponent.openDelete(this.dialog).pipe(
      switchMap(() => this.store.dispatch(new DeleteAction(packageBox))),
      tap(() => this.util.showSuccess()),
    ).subscribe();
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

  detail(packageBox: PackageBox) {
    PackageBoxDetailDialogPageComponent.open(this.dialog, packageBox);
  }

  batchTooltip(packageBox: PackageBox) {
    const {batch: {product, spec, tubeColor}} = packageBox;
    return `${product.name} — ${spec} — ${tubeColor}`;
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
    BatchInputComponentModule,
    PackageBoxDetailDialogPageComponentModule,
    RouterModule.forChild([
      {path: '', component: PackageBoxManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
