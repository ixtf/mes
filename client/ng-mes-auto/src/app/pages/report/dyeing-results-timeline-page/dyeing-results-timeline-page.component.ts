import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {LineMachineInputComponentModule} from '../../../components/line-machine-input/line-machine-input.component';
import {SilkSpecInputComponentModule} from '../../../components/silk-spec-input/silk-spec-input.component';
import {DyeingResult} from '../../../models/dyeing-result';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../app/app.state';
import {DyeingResultsTimelineItemComponent} from './dyeing-results-timeline-item/dyeing-results-timeline-item.component';
import {DyeingResultsTimelinePageState, InitAction, MoreAction, QueryAction} from './dyeing-results-timeline-page.state';

@Component({
  templateUrl: './dyeing-results-timeline-page.component.html',
  styleUrls: ['./dyeing-results-timeline-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DyeingResultsTimelinePageComponent {
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(DyeingResultsTimelinePageState.firsts)
  readonly firsts$: Observable<DyeingResult[]>;
  @Select(DyeingResultsTimelinePageState.firstsEnded)
  readonly firstsEnded$: Observable<boolean>;
  @Select(DyeingResultsTimelinePageState.crosses)
  readonly crosses$: Observable<DyeingResult[]>;
  @Select(DyeingResultsTimelinePageState.crossesEnded)
  readonly crossesEnded$: Observable<boolean>;
  readonly searchForm = this.fb.group({
    silkSpec: [null, Validators.required],
  });

  constructor(private store: Store,
              private route: ActivatedRoute,
              private fb: FormBuilder) {
    route.queryParams.subscribe((it: any) => store.dispatch(new InitAction(it)));
  }

  @Dispatch()
  query() {
    return new QueryAction(this.searchForm.value.silkSpec);
  }

  @Dispatch()
  more(type) {
    return new MoreAction({type});
  }
}

@NgModule({
  declarations: [
    DyeingResultsTimelinePageComponent,
    DyeingResultsTimelineItemComponent,
  ],
  entryComponents: [],
  imports: [
    NgxsModule.forFeature([DyeingResultsTimelinePageState]),
    SharedModule,
    LineMachineInputComponentModule,
    SilkSpecInputComponentModule,
    RouterModule.forChild([
      {path: '', component: DyeingResultsTimelinePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
