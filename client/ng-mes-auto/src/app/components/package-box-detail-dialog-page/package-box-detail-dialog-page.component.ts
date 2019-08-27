import {ChangeDetectionStrategy, Component, Inject, NgModule} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatExpansionModule} from '@angular/material';
import {Observable} from 'rxjs';
import {PackageBox} from '../../models/package-box';
import {Silk} from '../../models/silk';
import {SilkCarRecord} from '../../models/silk-car-record';
import {ApiService} from '../../services/api.service';
import {SharedModule} from '../../shared.module';

@Component({
  templateUrl: './package-box-detail-dialog-page.component.html',
  styleUrls: ['./package-box-detail-dialog-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageBoxDetailDialogPageComponent {
  packageBox: PackageBox;
  silks$: Observable<Silk[]>;
  silkCarRecords$: Observable<SilkCarRecord[]>;
  displayedColumns: string[];

  constructor(private api: ApiService,
              @Inject(MAT_DIALOG_DATA) data: PackageBox) {
    this.packageBox = data;
    if (this.packageBox.type === 'AUTO') {
      this.silks$ = this.api.getPackageBox_silks(this.packageBox.id);
      this.displayedColumns = ['code', 'spec', 'doffingNum', 'doffingType', 'doffingOperator', 'doffingDateTime'];
    } else if (this.packageBox.type === 'MANUAL') {
      this.silkCarRecords$ = this.api.getPackageBox_silkCarRecords(this.packageBox.id);
      this.displayedColumns = ['code'];
    }
  }

  static open(dialog: MatDialog, data: PackageBox) {
    return dialog.open(PackageBoxDetailDialogPageComponent, {data, width: '90vw'});
  }

}

@NgModule({
  declarations: [
    PackageBoxDetailDialogPageComponent,
  ],
  entryComponents: [
    PackageBoxDetailDialogPageComponent,
  ],
  imports: [
    SharedModule,
    MatExpansionModule,
  ],
  exports: [
    PackageBoxDetailDialogPageComponent,
  ],
})
export class PackageBoxDetailDialogPageComponentModule {
}
