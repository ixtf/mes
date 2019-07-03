import {ChangeDetectionStrategy, Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {Emittable, Emitter} from '@ngxs-labs/emitter';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, switchMap, takeUntil} from 'rxjs/operators';
import {isString} from 'util';
import {SilkCarRecordEventListComponentModule} from '../../components/flow-card/flow-card.component';
import {SilkCarRecordInfoComponentModule} from '../../components/silk-car-record-info/silk-car-record-info.component';
import {SilkCarRecord} from '../../models/silk-car-record';
import {ApiService} from '../../services/api.service';
import {SEARCH_DEBOUNCE_TIME} from '../../services/util.service';
import {SharedModule} from '../../shared.module';
import {QueryAction, SilkCarRecordPageState} from '../../store/silk-car-record-page.state';

@Component({
  templateUrl: './silk-car-record-page.component.html',
  styleUrls: ['./silk-car-record-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkCarRecordPageComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject();
  silkCarQCtrl = new FormControl();
  autoCompleteSilkCars$ = this.silkCarQCtrl.valueChanges.pipe(
    takeUntil(this.destroy$),
    debounceTime(SEARCH_DEBOUNCE_TIME),
    distinctUntilChanged(),
    filter(it => it && isString(it) && it.trim().length > 1),
    switchMap(q => this.apiService.autoCompleteSilkCar(q))
  );
  form = this.fb.group({
    startDate: [new Date(), Validators.required],
    endDate: [new Date(), Validators.required],
    sort: 'desc',
  });
  @Select(SilkCarRecordPageState.silkCarRecords)
  silkCarRecords$: Observable<SilkCarRecord[]>;
  @Emitter(SilkCarRecordPageState.OnInit)
  OnInit$: Emittable<void>;

  constructor(private fb: FormBuilder,
              private store: Store,
              private apiService: ApiService) {
  }

  ngOnInit(): void {
    this.OnInit$.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @Dispatch()
  query() {
    return new QueryAction(this.form.value);
  }

}

@NgModule({
  declarations: [
    SilkCarRecordPageComponent,
  ],
  imports: [
    NgxsModule.forFeature([SilkCarRecordPageState]),
    SharedModule,
    SilkCarRecordInfoComponentModule,
    SilkCarRecordEventListComponentModule,
    RouterModule.forChild([
      {path: '', component: SilkCarRecordPageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
