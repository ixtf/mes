import {ChangeDetectionStrategy, Component, Input, NgModule} from '@angular/core';
import {EventSource} from '../../models/event-source';
import {SilkCarRecord} from '../../models/silk-car-record';
import {SilkCarRuntime} from '../../models/silk-car-runtime';
import {insertRemoveAnimation} from '../../services/animations';
import {EVENT_SOURCE_COMPARE} from '../../services/util.service';
import {SharedModule} from '../../shared.module';
import {DyeingPrepareEventComponent} from './dyeing-prepare-event/dyeing-prepare-event.component';
import {JikonAdapterSilkCarInfoFetchEventComponent} from './jikon-adapter-silk-car-info-fetch-event/jikon-adapter-silk-car-info-fetch-event.component';
import {JikonAdapterSilkDetachEventComponent} from './jikon-adapter-silk-detach-event/jikon-adapter-silk-detach-event.component';
import {PackageBoxEventComponent} from './package-box-event/package-box-event.component';
import {ProductProcessSubmitEventComponent} from './product-process-submit-event/product-process-submit-event.component';
import {RiambSilkCarInfoFetchEventComponent} from './riamb-silk-car-info-fetch-event/riamb-silk-car-info-fetch-event.component';
import {RiambSilkDetachEventComponent} from './riamb-silk-detach-event/riamb-silk-detach-event.component';
import {SilkNoteFeedbackEventComponent} from './silk-note-feedback-event/silk-note-feedback-event.component';
import {SilkRuntimeDetachEventComponent} from './silk-runtime-detach-event/silk-runtime-detach-event.component';
import {ToDtyConfirmEventComponent} from './to-dty-confirm-event/to-dty-confirm-event.component';
import {ToDtyEventComponent} from './to-dty-event/to-dty-event.component';

@Component({
  selector: 'app-flow-card',
  templateUrl: './flow-card.component.html',
  styleUrls: ['./flow-card.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    insertRemoveAnimation
  ],
})
export class FlowCardComponent {
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;
  @Input()
  private setting: any;

  get events(): EventSource[] {
    let events: EventSource[] = [];
    if (this.silkCarRuntime) {
      events = this.silkCarRuntime.eventSources;
    }
    if (this.silkCarRecord) {
      events = this.silkCarRecord.eventSources;
    }
    return (events || []).filter(it => {
      if (this.setting.showAll) {
        return true;
      }
      return !it.deleted;
    }).sort((a, b) => {
      const i = EVENT_SOURCE_COMPARE(a, b);
      return this.setting.sort === 'desc' ? i : (i * -1);
    });
  }
}

@NgModule({
  declarations: [
    FlowCardComponent,
    ProductProcessSubmitEventComponent,
    PackageBoxEventComponent,
    DyeingPrepareEventComponent,
    SilkRuntimeDetachEventComponent,
    JikonAdapterSilkCarInfoFetchEventComponent,
    JikonAdapterSilkDetachEventComponent,
    SilkNoteFeedbackEventComponent,
    RiambSilkDetachEventComponent,
    RiambSilkCarInfoFetchEventComponent,
    ToDtyEventComponent,
    ToDtyConfirmEventComponent,
  ],
  imports: [
    SharedModule,
  ],
  exports: [
    FlowCardComponent,
  ],
})
export class SilkCarRecordEventListComponentModule {
}
