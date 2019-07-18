import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {JikonAdapterSilkCarInfoFetchEvent} from '../../../models/event-source';
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
  readonly displayedColumns = ['actualPosition', 'code', 'grabFlage', 'eliminateFlage'];
  @Input()
  private silkCarRuntime: SilkCarRuntime;
  @Input()
  private silkCarRecord: SilkCarRecord;

  get dataSource() {
    return new MatTableDataSource(this.data.list.sort((a, b) => {
      return a.actualPosition - b.actualPosition;
    }));
  }

  get data(): { bindNum: string, list: any[] } {
    return JSON.parse(this.event.result).data;
  }

}
