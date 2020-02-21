import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatExpansionModule} from '@angular/material/expansion';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, switchMap, takeUntil} from 'rxjs/operators';
import {SilkCarRecordEventListComponentModule} from '../../components/flow-card/flow-card.component';
import {SilkCarRecordInfoComponentModule} from '../../components/silk-car-record-info/silk-car-record-info.component';
import {SilkCar} from '../../models/silk-car';
import {SilkCarRecord} from '../../models/silk-car-record';
import {ApiService} from '../../services/api.service';
import {PAGE_SIZE_OPTIONS, SEARCH_DEBOUNCE_TIME} from '../../services/util.service';
import {SharedModule} from '../../shared.module';
import {AppState} from '../app/app.state';
import {InitAction, PickAction, QueryAction, SilkCarRecordPageState} from './silk-car-record-page.state';

@Component({
  templateUrl: './silk-car-record-page.component.html',
  styleUrls: ['./silk-car-record-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkCarRecordPageComponent {
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(SilkCarRecordPageState.silkCarRecords)
  readonly silkCarRecords$: Observable<SilkCarRecord[]>;
  @Select(SilkCarRecordPageState.silkCarRecord)
  readonly silkCarRecord$: Observable<SilkCarRecord>;
  @Select(SilkCarRecordPageState.count)
  readonly count$: Observable<number>;
  @Select(SilkCarRecordPageState.pageSize)
  readonly pageSize$: Observable<number>;
  readonly searchForm = this.fb.group({
    silkCarCode: [null, Validators.required],
    startDate: [new Date(), Validators.required],
    endDate: [new Date(), Validators.required],
  });
  readonly settingForm = this.fb.group({
    sort: 'asc',
    showAll: false,
  });
  readonly silkCarQCtrl = new FormControl();
  private readonly destroy$ = new Subject();
  readonly autoCompleteSilkCars$ = this.silkCarQCtrl.valueChanges.pipe(
    takeUntil(this.destroy$),
    debounceTime(SEARCH_DEBOUNCE_TIME),
    distinctUntilChanged(),
    filter(it => it && (typeof it === 'string') && it.trim().length > 1),
    switchMap(q => this.api.autoCompleteSilkCar(q)),
  );

  constructor(private store: Store,
              private route: ActivatedRoute,
              private fb: FormBuilder,
              private api: ApiService) {
    route.queryParams.subscribe((it: any) => store.dispatch(new InitAction(it)));
  }

  readonly displayWithSilkCar = (silkCar: SilkCar) => silkCar && silkCar.code;


  onSilkCarSelected(ev: MatAutocompleteSelectedEvent) {
    const silkCarCodeCtrl = this.searchForm.get('silkCarCode');
    silkCarCodeCtrl.patchValue(ev.option.value.code);
    silkCarCodeCtrl.markAsDirty();
  }

  @Dispatch()
  query() {
    return new QueryAction(this.searchForm.value);
  }

  @Dispatch()
  pick(silkCarRecord: SilkCarRecord) {
    return new PickAction({silkCarRecord});
  }
}

@NgModule({
  declarations: [
    SilkCarRecordPageComponent,
  ],
  imports: [
    NgxsModule.forFeature([SilkCarRecordPageState]),
    SharedModule,
    MatExpansionModule,
    SilkCarRecordInfoComponentModule,
    SilkCarRecordEventListComponentModule,
    RouterModule.forChild([
      {path: '', component: SilkCarRecordPageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
