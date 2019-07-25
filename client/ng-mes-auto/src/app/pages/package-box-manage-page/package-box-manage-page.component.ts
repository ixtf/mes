import {ChangeDetectionStrategy, Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {PackageBoxPrintComponent, PackageBoxPrintComponentModule} from '../../components/package-box-print/package-box-print.component';
import {ExceptionRecord} from '../../models/exception-record';
import {PackageBox} from '../../models/package-box';
import {ApiService} from '../../services/api.service';
import {CodeCompare} from '../../services/util.service';
import {SharedModule} from '../../shared.module';
import {AppState} from '../../store/app.state';
import {DeleteAction, InitAction, PackageBoxManagePageState, SaveAction} from '../../store/package-box-manage-page.state';
import {PackageBoxUpdateDialogComponent} from './package-box-update-dialog/package-box-update-dialog.component';

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
  readonly displayedColumns = ['workshops', 'lines', 'note', 'modifier', 'modifyDateTime', 'btns'];
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
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  create() {
    this.api.getPackageBox('5d19a8a46dedd800019a6c8b').subscribe(it => {
      PackageBoxPrintComponent.print(this.dialog, [it, it]);
    });
    // this.update(new PackageBox());
  }

  @Dispatch()
  update(packageBox: PackageBox) {
    return PackageBoxUpdateDialogComponent.open(this.dialog, packageBox).afterClosed().pipe(
      filter(it => !!it),
      map(it => new SaveAction(it))
    );
  }

  @Dispatch()
  delete(packageBox: PackageBox) {
    return new DeleteAction(packageBox);
  }

  isShow(exceptionRecord: ExceptionRecord) {
    const isAdmin = this.store.selectSnapshot(AppState.authInfoIsAdmin);
    if (isAdmin) {
      return true;
    }
    const currentId = this.store.selectSnapshot(AppState.authInfoId);
    return exceptionRecord.creator.id === currentId;
  }
}

@NgModule({
  declarations: [
    PackageBoxManagePageComponent,
    PackageBoxUpdateDialogComponent,
  ],
  entryComponents: [
    PackageBoxUpdateDialogComponent
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
