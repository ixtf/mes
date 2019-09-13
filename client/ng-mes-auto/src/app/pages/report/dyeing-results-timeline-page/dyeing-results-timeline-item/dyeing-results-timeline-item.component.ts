import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {DyeingResult} from '../../../../models/dyeing-result';
import {ApiService} from '../../../../services/api.service';
import {COPY_WITH_CTRL, UtilService} from '../../../../services/util.service';

@Component({
  selector: 'app-dyeing-results-timeline-item',
  templateUrl: './dyeing-results-timeline-item.component.html',
  styleUrls: ['./dyeing-results-timeline-item.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DyeingResultsTimelineItemComponent {
  readonly copy = COPY_WITH_CTRL;
  @Input()
  dyeingResult: DyeingResult;

  constructor(private api: ApiService,
              private util: UtilService) {
  }


}

