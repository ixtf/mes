import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {SilkSpecInputComponentModule} from '../../../components/silk-spec-input/silk-spec-input.component';
import {SharedModule} from '../../../shared.module';
import {FlipReportItem, FlipReportPageState, InitAction, QueryAction} from './flip-report-page.state';

@Component({
  templateUrl: './flip-report-page.component.html',
  styleUrls: ['./flip-report-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlipReportPageComponent {
  @Select(FlipReportPageState.items)
  readonly items$: Observable<FlipReportItem[]>;
  readonly searchForm = this.fb.group({
    silkSpec: [null, Validators.required],
    startDate: [new Date(), [Validators.required]],
    endDate: [new Date(), [Validators.required]],
  });

  constructor(private store: Store,
              private fb: FormBuilder) {
    store.dispatch(new InitAction());
  }

  @Dispatch()
  query() {
    return new QueryAction(this.searchForm.value);
  }

}

@NgModule({
  declarations: [
    FlipReportPageComponent,
  ],
  entryComponents: [],
  imports: [
    NgxsModule.forFeature([FlipReportPageState]),
    SharedModule,
    SilkSpecInputComponentModule,
    RouterModule.forChild([
      {path: '', component: FlipReportPageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
