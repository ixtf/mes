import {ChangeDetectionStrategy, Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog, MatTableDataSource} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {PackageBoxPrintComponentModule} from '../../components/package-box-print/package-box-print.component';
import {PackageBox} from '../../models/package-box';
import {ApiService} from '../../services/api.service';
import {CodeCompare} from '../../services/util.service';
import {SharedModule} from '../../shared.module';
import {AppState} from '../../store/app.state';
import {DeleteAction, InitAction, PackageBoxManagePageState} from '../../store/package-box-manage-page.state';

@Component({
  templateUrl: './package-box-manage-page.component.html',
  styleUrls: ['./package-box-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageBoxManagePageComponent implements OnInit, OnDestroy {
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(PackageBoxManagePageState.packageBoxes)
  readonly packageBoxes$: Observable<PackageBox[]>;
  readonly dataSource: PackageBoxDataSource;
  readonly displayedColumns = ['code', 'batch', 'grade', 'silkCountSpec', 'sapT001lSpec', 'budat', 'budatClass', 'palletType', 'packageType', 'foamType', 'foamNum', 'creator', 'createDateTime', 'palletCode', 'btns'];
  readonly searchForm = this.fb.group({
    workshopId: [null, Validators.required],
    budatClassId: null,
    productId: null,
    startDate: [new Date(), Validators.required],
    endDate: [new Date(), Validators.required],
  });
  readonly workshops$ = this.api.listWorkshop().pipe(map(it => (it || []).sort(CodeCompare)));
  readonly products$ = this.api.listProduct();
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
  delete(packageBox: PackageBox) {
    return new DeleteAction(packageBox);
  }

  create() {

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
