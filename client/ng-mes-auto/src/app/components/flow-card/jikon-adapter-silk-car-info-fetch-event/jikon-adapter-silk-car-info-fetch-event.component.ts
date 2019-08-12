import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {EventSource, JikonAdapterSilkCarInfoFetchEvent, JikonAdapterSilkDetachEvent} from '../../../models/event-source';
import {SilkCarRecord} from '../../../models/silk-car-record';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';

@Component({
  selector: 'app-jikon-adapter-silk-car-info-fetch-event',
  templateUrl: './jikon-adapter-silk-car-info-fetch-event.component.html',
  styleUrls: ['./jikon-adapter-silk-car-info-fetch-event.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JikonAdapterSilkCarInfoFetchEventComponent {
  @Input()
  event: JikonAdapterSilkCarInfoFetchEvent;
  readonly displayedColumns = ['actualPosition', 'code', 'grabFlage', 'eliminateFlage', 'detached'];
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;

  get dataSource() {
    const detachSilkCodes = (this.events || []).filter(it => it.type === 'JikonAdapterSilkDetachEvent').reduce((acc, cur) => {
      const ev = cur as JikonAdapterSilkDetachEvent;
      const silkCodes = ev.command.spindleCode && ev.command.spindleCode.split(',');
      return acc.concat(silkCodes || []);
    }, []);
    return new MatTableDataSource(this.data.list.map(data => {
      console.log(data);
      const find = detachSilkCodes.find(it => it === data.spindleCode);
      data.detached = !!find;
      return data;
    }).sort((a, b) => {
      return a.actualPosition - b.actualPosition;
    }));
  }

  get data(): { bindNum: string, list: { batchNo: string; spindleCode: string; actualPosition: number; detached: boolean }[] } {
    return JSON.parse(this.event.result).data;
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
