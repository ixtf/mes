import {SelectionModel} from '@angular/cdk/collections';
import {ChangeDetectionStrategy, Component, ElementRef, NgModule, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {MatDialog, MatTableDataSource, PageEvent} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {QRCodeModule} from 'angularx-qrcode';
import {NgxBarcodeModule} from 'ngx-barcode';
import {NgxPrintModule} from 'ngx-print';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {BarcodeDialogComponentModule} from '../../../components/barcode-dialog/barcode-dialog.component';
import {PackageBoxPrintComponent, PackageBoxPrintComponentModule} from '../../../components/package-box-print/package-box-print.component';
import {QrcodeDialogComponentModule} from '../../../components/qrcode-dialog/qrcode-dialog.component';
import {SilkCar} from '../../../models/silk-car';
import {ApiService} from '../../../services/api.service';
import {PAGE_SIZE_OPTIONS} from '../../../services/util.service';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {InitAction, QueryAction, SilkCarManagePageState} from '../../../store/silk-car-manage-page.state';

@Component({
  templateUrl: './silk-car-manage-page.component.html',
  styleUrls: ['./silk-car-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkCarManagePageComponent implements OnInit, OnDestroy {
  readonly displayedColumns = ['select', 'code', 'number', 'rowAndCol', 'type', 'btns'];
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(SilkCarManagePageState.silkCars)
  readonly silkCars$: Observable<SilkCar[]>;
  @Select(SilkCarManagePageState.count)
  readonly count$: Observable<number>;
  @Select(SilkCarManagePageState.pageIndex)
  readonly pageIndex$: Observable<number>;
  @Select(SilkCarManagePageState.pageSize)
  readonly pageSize$: Observable<number>;
  readonly searchForm = this.fb.group({
    q: null,
  });
  readonly dataSource: SilkCarDataSource;
  readonly selection = new SelectionModel<SilkCar>(true, []);
  private readonly destroy$ = new Subject();
  printSilkCar: SilkCar;
  @ViewChild('testPrint', {static: true})
  readonly el: ElementRef;

  constructor(private store: Store,
              private fb: FormBuilder,
              private api: ApiService,
              private dialog: MatDialog) {
    this.store.dispatch(new InitAction());
    this.dataSource = new SilkCarDataSource(this.silkCars$.pipe(takeUntil(this.destroy$)));
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  create() {
    console.log(this.selection);
    this.update(new SilkCar());
  }

  update(silkCar: SilkCar) {

  }

  batchCreate() {
  }

  @Dispatch()
  onPageEvent(ev: PageEvent) {
    const first = ev.pageIndex * ev.pageSize;
    return new QueryAction({first, pageSize: ev.pageSize});
  }

  print(silkCar: SilkCar) {
    // forkJoin([
    //   this.api.getPackageBox('5d19a8a46dedd800019a6c8b'),
    //   this.api.getPackageBox('5d19a8a46dedd800019a6c8b'),
    // ])
    this.api.getPackageBox('5d19a8a46dedd800019a6c8b').subscribe(it => {
      PackageBoxPrintComponent.print(this.dialog, [it, it]);
    });
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
}

class SilkCarDataSource extends MatTableDataSource<SilkCar> {
  private readonly subject = new BehaviorSubject<SilkCar[]>([]);

  constructor(private silkCars$: Observable<SilkCar[]>) {
    super();
    silkCars$.subscribe(it => this.subject.next(it || []));
  }

  get data(): SilkCar[] {
    return this.subject.value;
  }

  connect(): BehaviorSubject<SilkCar[]> {
    return this.subject;
  }
}

@NgModule({
  declarations: [
    SilkCarManagePageComponent,
  ],
  imports: [
    NgxsModule.forFeature([SilkCarManagePageState]),
    SharedModule,
    NgxPrintModule,
    NgxBarcodeModule,
    QRCodeModule,
    BarcodeDialogComponentModule,
    QrcodeDialogComponentModule,
    PackageBoxPrintComponentModule,
    RouterModule.forChild([
      {path: '', component: SilkCarManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
