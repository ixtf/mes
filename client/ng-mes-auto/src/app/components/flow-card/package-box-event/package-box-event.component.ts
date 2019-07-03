import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {PackageBoxEvent} from '../../../models/event-source';
import {PackageBox} from '../../../models/package-box';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';

@Component({
  selector: 'app-package-box-event',
  templateUrl: './package-box-event.component.html',
  styleUrls: ['./package-box-event.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageBoxEventComponent {
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;
  @Input()
  event: PackageBoxEvent;
  displayedColumns = ['code', 'grade', 'netWeight', 'silkCount'];

  get packageBox(): PackageBox {
    return this.event.packageBox;
  }
}
