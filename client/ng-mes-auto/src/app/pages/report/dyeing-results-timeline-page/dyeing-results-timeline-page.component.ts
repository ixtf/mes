import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {LineMachineInputComponentModule} from '../../../components/line-machine-input/line-machine-input.component';
import {DyeingResult} from '../../../models/dyeing-result';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {DyeingResultsTimelinePageState, InitAction, MoreAction, QueryAction} from '../../../store/dyeing-results-timeline-page.state';
import {DyeingResultsTimelineItemComponent} from './dyeing-results-timeline-item/dyeing-results-timeline-item.component';

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
    lineMachine: [null, Validators.required],
    spindle: [null, [Validators.required, Validators.min(1)]],
  });

  constructor(private store: Store,
              private route: ActivatedRoute,
              private fb: FormBuilder) {
    route.queryParams.subscribe((it: any) => store.dispatch(new InitAction(it)));
  }

  @Dispatch()
  query() {
    const {lineMachine, spindle} = this.searchForm.value;
    return new QueryAction({lineMachineId: lineMachine.id, spindle});
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
    RouterModule.forChild([
      {path: '', component: DyeingResultsTimelinePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
