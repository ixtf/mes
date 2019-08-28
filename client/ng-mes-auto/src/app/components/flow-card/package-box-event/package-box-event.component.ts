import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatDialog} from '@angular/material';
import {PackageBoxEvent} from '../../../models/event-source';
import {PackageBox} from '../../../models/package-box';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';
import {PackageBoxDetailDialogPageComponent} from '../../package-box-detail-dialog-page/package-box-detail-dialog-page.component';

@Component({
  selector: 'app-package-box-event',
  templateUrl: './package-box-event.component.html',
  styleUrls: ['./package-box-event.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageBoxEventComponent {
  @Input()
  event: PackageBoxEvent;
  displayedColumns = ['code', 'grade', 'netWeight', 'silkCount', 'btns'];
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;

  constructor(private dialog: MatDialog) {
  }

  get packageBox(): PackageBox {
    return this.event.packageBox;
  }

  detail() {
    PackageBoxDetailDialogPageComponent.open(this.dialog, this.packageBox);
  }
}
