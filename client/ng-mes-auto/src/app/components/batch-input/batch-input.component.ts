/* tslint:disable:semicolon */
import {FocusMonitor} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostBinding, Input, NgModule, OnDestroy, OnInit, Optional, Output, Self} from '@angular/core';
import {ControlValueAccessor, FormControl, NgControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatFormFieldControl} from '@angular/material';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, switchMap} from 'rxjs/operators';
import {isString} from 'util';
import {Batch} from '../../models/batch';
import {ApiService} from '../../services/api.service';
import {DISPLAY_WITH_BATCH, SEARCH_DEBOUNCE_TIME} from '../../services/util.service';
import {SharedModule} from '../../shared.module';

@Component({
  selector: 'app-batch-input',
  templateUrl: './batch-input.component.html',
  styleUrls: ['./batch-input.component.less'],
  providers: [
    {provide: MatFormFieldControl, useExisting: BatchInputComponent},
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatchInputComponent implements ControlValueAccessor, MatFormFieldControl<Batch>, OnInit, OnDestroy {
  static nextId = 0;
  @Output()
  readonly optionSelected = new EventEmitter<MatAutocompleteSelectedEvent>();
  @HostBinding()
  readonly id = `batch-input-${BatchInputComponent.nextId++}`;
  @HostBinding('attr.aria-describedby')
  describedBy = '';
  readonly stateChanges = new Subject<void>();
  readonly displayWithBatch = DISPLAY_WITH_BATCH;
  focused = false;
  readonly qCtrl = new FormControl();
  readonly autoData$ = this.qCtrl.valueChanges.pipe(
    filter(it => it && isString(it) && it.trim().length > 1),
    debounceTime(SEARCH_DEBOUNCE_TIME),
    distinctUntilChanged(),
    switchMap(q => this.api.autoCompleteBatch(q)),
  );

  constructor(private api: ApiService,
              private focusMonitor: FocusMonitor,
              private elementRef: ElementRef<HTMLElement>,
              @Optional() @Self() public ngControl: NgControl) {
    focusMonitor.monitor(elementRef, true).subscribe(origin => {
      if (this.focused && !origin) {
        this.onTouched();
      }
      this.focused = !!origin;
      this.stateChanges.next();
    });
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  private _disabled = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.qCtrl.disable() : this.qCtrl.enable();
    this.stateChanges.next();
  }

  private _placeholder: string;

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }

  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }

  private _required = false;

  @Input()
  get required(): boolean {
    return this._required;
  }

  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  get empty() {
    return !this.qCtrl.value;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  get errorState(): boolean {
    if (this.disabled) {
      return false;
    }
    return !!this.qCtrl.errors;
  }

  @Input()
  get value(): Batch | null {
    if (this.errorState) {
      return null;
    }
    if (this.qCtrl.value && this.qCtrl.value.id) {
      return this.qCtrl.value;
    }
    return null;
  }

  set value(batch: Batch | null) {
    this.qCtrl.patchValue(batch);
    this.stateChanges.next();
  }

  ngOnInit(): void {
    this.qCtrl.valueChanges.subscribe(() => this.onChange(this.value));
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
    this.focusMonitor.stopMonitoring(this.elementRef);
  }

  onContainerClick(event: MouseEvent): void {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this.elementRef.nativeElement.querySelector('input').focus();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(' ');
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: Batch | null): void {
    this.value = obj;
  }

  private onChange = (_: any) => {
  };

  private onTouched = () => {
  };
}


@NgModule({
  declarations: [
    BatchInputComponent,
  ],
  imports: [
    SharedModule,
  ],
  exports: [
    BatchInputComponent,
  ],
})
export class BatchInputComponentModule {
}
