import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {EventSource, RiambSilkCarInfoFetchEvent, RiambSilkDetachEvent} from '../../../models/event-source';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';

interface Result {
  silkCount: number;
  silkInfos: SilkInfo[];
}

interface SilkInfo {
  sideType: string;
  code: string;
  row: number;
  col: number;
  gradeName: string;
  detached: boolean;
}

@Component({
  selector: 'app-riamb-silk-car-info-fetch-event',
  templateUrl: './riamb-silk-car-info-fetch-event.component.html',
  styleUrls: ['./riamb-silk-car-info-fetch-event.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiambSilkCarInfoFetchEventComponent {
  @Input()
  event: RiambSilkCarInfoFetchEvent;
  displayedColumns = ['position', 'code', 'grade', 'grabFlage', 'eliminateFlage', 'detached'];
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;

  get dataSource() {
    return new MatTableDataSource(this.silkInfos);
  }

  get silkInfos(): SilkInfo[] {
    const detachSilkCodes = (this.events || []).filter(it => it.type === 'RiambSilkDetachEvent').reduce((acc, cur) => {
      const ev = cur as RiambSilkDetachEvent;
      return acc.concat(ev.command.silkCodes);
    }, []);
    return (this.data.silkInfos || []).map(silkInfo => {
      const find = detachSilkCodes.find(it => it === silkInfo.code);
      silkInfo.detached = !!find;
      return silkInfo;
    }).sort((a, b) => {
      if (a.detached === b.detached) {
        return `${a.sideType}-${a.row}-${a.col}`.localeCompare(`${b.sideType}-${b.row}-${b.col}`);
      }
      return a.detached ? 1 : -1;
    });
  }

  get data(): Result {
    return JSON.parse(this.event.result);
  }

  get events(): EventSource[] {
    if (this.silkCarRuntime) {
      return this.silkCarRuntime.eventSources;
    }
    if (this.silkCarRecord) {
      return this.silkCarRecord.eventSources;
    }
    return null;
  }

}
