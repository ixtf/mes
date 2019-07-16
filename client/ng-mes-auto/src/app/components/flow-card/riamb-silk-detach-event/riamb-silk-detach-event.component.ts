import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {RiambSilkDetachEvent} from '../../../models/event-source';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';

@Component({
  selector: 'app-riamb-silk-detach-event',
  templateUrl: './riamb-silk-detach-event.component.html',
  styleUrls: ['./riamb-silk-detach-event.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiambSilkDetachEventComponent {
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;
  @Input()
  event: RiambSilkDetachEvent;

  get codes(): string[] {
    return this.event.command.silkCodes;
  }
}
