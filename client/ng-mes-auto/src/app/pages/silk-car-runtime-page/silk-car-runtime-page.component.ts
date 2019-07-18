import {ChangeDetectionStrategy, Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {Emittable, Emitter} from '@ngxs-labs/emitter';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, switchMap, takeUntil} from 'rxjs/operators';
import {isString} from 'util';
import {SilkCarRecordEventListComponentModule} from '../../components/flow-card/flow-card.component';
import {SilkCarRecordInfoComponentModule} from '../../components/silk-car-record-info/silk-car-record-info.component';
import {SilkCarRuntime} from '../../models/silk-car-runtime';
import {insertRemoveAnimation} from '../../services/animations';
import {ApiService} from '../../services/api.service';
import {SEARCH_DEBOUNCE_TIME} from '../../services/util.service';
import {SharedModule} from '../../shared.module';
import {FetchAction, SilkCarRuntimePageState} from '../../store/silk-car-runtime-page.state';

@Component({
  templateUrl: './silk-car-runtime-page.component.html',
  styleUrls: ['./silk-car-runtime-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    insertRemoveAnimation,
  ],
})
export class SilkCarRuntimePageComponent implements OnInit, OnDestroy {
  silkCarQCtrl = new FormControl();
  settingForm = this.fb.group({
    sort: 'desc',
    showAll: false,
  });
  @Select(SilkCarRuntimePageState.silkCarRuntime)
  silkCarRuntime$: Observable<SilkCarRuntime>;
  @Emitter(SilkCarRuntimePageState.OnInit)
  OnInit$: Emittable<void>;
  private readonly destroy$ = new Subject();
  autoCompleteSilkCars$ = this.silkCarQCtrl.valueChanges.pipe(
    takeUntil(this.destroy$),
    debounceTime(SEARCH_DEBOUNCE_TIME),
    distinctUntilChanged(),
    filter(it => it && isString(it) && it.trim().length > 1),
    switchMap(q => this.api.autoCompleteSilkCar(q))
  );

  constructor(private fb: FormBuilder,
              private store: Store,
              private api: ApiService) {
  }

  ngOnInit(): void {
    this.OnInit$.emit();
    // this.store.dispatch(new FetchAction('3000F48001'));
    // this.store.dispatch(new FetchAction('YJ048F0002'));
    // this.store.dispatch(new FetchAction('3000F2345'));
    this.store.dispatch(new FetchAction('3000F30606'));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @Dispatch()
  onSilkCarSelected(event: MatAutocompleteSelectedEvent) {
    return new FetchAction(event.option.value);
  }

}

@NgModule({
  declarations: [
    SilkCarRuntimePageComponent,
  ],
  imports: [
    NgxsModule.forFeature([SilkCarRuntimePageState]),
    SharedModule,
    SilkCarRecordInfoComponentModule,
    SilkCarRecordEventListComponentModule,
    RouterModule.forChild([
      {path: '', component: SilkCarRuntimePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
