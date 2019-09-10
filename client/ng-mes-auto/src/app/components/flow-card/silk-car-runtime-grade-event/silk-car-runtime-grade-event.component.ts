import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Store} from '@ngxs/store';
import {SilkCarRuntimeGradeEvent} from '../../../models/event-source';
import {Grade} from '../../../models/grade';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';

@Component({
  selector: 'app-silk-car-runtime-grade-event',
  templateUrl: './silk-car-runtime-grade-event.component.html',
  styleUrls: ['./silk-car-runtime-grade-event.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkCarRuntimeGradeEventComponent {
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;

  constructor(private store: Store) {
  }

  _event: SilkCarRuntimeGradeEvent;

  get event(): SilkCarRuntimeGradeEvent {
    return this._event;
  }

  @Input()
  set event(ev: SilkCarRuntimeGradeEvent) {
    this._event = ev;
  }

  get grade(): Grade {
    return this.event.grade;
  }

}
