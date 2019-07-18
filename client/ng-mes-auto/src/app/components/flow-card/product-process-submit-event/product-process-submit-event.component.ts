import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ProductProcessSubmitEvent} from '../../../models/event-source';
import {ProductProcess} from '../../../models/product-process';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';
import {SilkRuntime} from '../../../models/silk-runtime';

@Component({
  selector: 'app-product-process-submit-event',
  templateUrl: './product-process-submit-event.component.html',
  styleUrls: ['./product-process-submit-event.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductProcessSubmitEventComponent {
  @Input()
  event: ProductProcessSubmitEvent;
  displayedColumns = ['position', 'spec', 'code', 'grade'];
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;

  get productProcess(): ProductProcess {
    return this.event.productProcess;
  }

  get silkRuntimes(): SilkRuntime[] {
    return this.event.silkRuntimes.sort((a, b) => {
      return a.silk.code.localeCompare(b.silk.code);
    });
  }

}
