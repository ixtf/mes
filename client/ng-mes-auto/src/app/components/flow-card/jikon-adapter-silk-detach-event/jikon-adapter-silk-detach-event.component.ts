import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {JikonAdapterSilkDetachEvent} from '../../../models/event-source';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';

@Component({
  selector: 'app-jikon-adapter-silk-detach-event',
  templateUrl: './jikon-adapter-silk-detach-event.component.html',
  styleUrls: ['./jikon-adapter-silk-detach-event.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JikonAdapterSilkDetachEventComponent {
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;
  @Input()
  private event: JikonAdapterSilkDetachEvent;

  get codes(): string[] {
    return this.event.command.spindleCode.split(',');
  }
}
