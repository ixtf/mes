/* tslint:disable:semicolon */
import {FocusMonitor} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostBinding, Input, NgModule, OnDestroy, OnInit, Optional, Output, Self} from '@angular/core';
import {ControlValueAccessor, FormBuilder, FormControl, NgControl, Validators} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatFormFieldControl} from '@angular/material/form-field';
import {combineLatest, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, switchMap, tap} from 'rxjs/operators';
import {LineMachine} from '../../models/line-machine';
import {ApiService} from '../../services/api.service';
import {DISPLAY_WITH_LINE, SEARCH_DEBOUNCE_TIME, VALIDATORS} from '../../services/util.service';
import {SharedModule} from '../../shared.module';

export class SilkSpec {
  constructor(public lineMachine: LineMachine,
              public spindle: number) {
  }
}

@Component({
  selector: 'app-silk-spec-input',
  templateUrl: './silk-spec-input.component.html',
  styleUrls: ['./silk-spec-input.component.less'],
  providers: [
    {provide: MatFormFieldControl, useExisting: SilkSpecInputComponent},
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkSpecInputComponent implements ControlValueAccessor, MatFormFieldControl<SilkSpec>, OnInit, OnDestroy {
  static nextId = 0;
  readonly displayWithLine = DISPLAY_WITH_LINE;
  @Output()
  readonly optionSelected = new EventEmitter<MatAutocompleteSelectedEvent>();
  @HostBinding()
  readonly id = `silk-spec-input-${SilkSpecInputComponent.nextId++}`;
  @HostBinding('attr.aria-describedby')
  describedBy = '';
  readonly stateChanges = new Subject<void>();
  form = this.fb.group({
    line: [null, [Validators.required, VALIDATORS.isEntity]],
    item: [null, [Validators.required, Validators.min(1)]],
    spindle: [null, [Validators.required, Validators.min(1)]],
  });
  readonly valueCtrl = new FormControl();
  focused = false;
  autoCompleteLines$ = this.lineCtrl.valueChanges.pipe(
    filter(it => it && (typeof it === 'string') && (it.trim().length > 0)),
    debounceTime(SEARCH_DEBOUNCE_TIME),
    distinctUntilChanged(),
    switchMap(q => this.api.autoCompleteLine(q)),
  );

  constructor(private api: ApiService,
              private fb: FormBuilder,
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

  get lineCtrl() {
    return this.form.get('line');
  }

  get itemCtrl() {
    return this.form.get('item');
  }

  get spindleCtrl() {
    return this.form.get('spindle');
  }

  private _disabled = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
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
    return !(this.itemCtrl.value || this.spindleCtrl.value || this.lineCtrl.value);
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  get errorState(): boolean {
    if (this.disabled || this.form.pristine) {
      return false;
    }
    return !this.value;
  }

  @Input()
  get value(): SilkSpec | null {
    return this.valueCtrl.value;
  }

  set value(silkSpec: SilkSpec | null) {
    this.valueCtrl.patchValue(silkSpec);
    this.stateChanges.next();
  }

  ngOnInit(): void {
    this.valueCtrl.valueChanges.subscribe(() => this.onChange(this.value));
    const lineMachines$ = this.lineCtrl.valueChanges.pipe(
      filter(it => it && it.id),
      map(it => it.id),
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      switchMap(it => this.api.getLine_LineMachines(it)),
    );
    const lineMachine$ = combineLatest([this.itemCtrl.valueChanges, lineMachines$]).pipe(
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      map(([item, lineMachines]) => (lineMachines || []).find(it => it.item === item)),
    );
    combineLatest([this.spindleCtrl.valueChanges, lineMachine$]).pipe(
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      tap(([spindle, lineMachine]) => {
        const spindleNum = lineMachine && lineMachine.spindleNum;
        if (spindle > 0 && spindle <= spindleNum) {
          this.value = {lineMachine, spindle};
        } else {
          this.value = null;
        }
      }),
    ).subscribe();
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

  writeValue(obj: SilkSpec): void {
    if (obj) {
      this.value = obj;
      this.lineCtrl.setValue(obj.lineMachine.line);
      this.itemCtrl.setValue(obj.lineMachine.item);
      this.spindleCtrl.setValue(obj.spindle);
    }
  }

  private onChange = (_: any) => {
  };

  private onTouched = () => {
  };
}


@NgModule({
  declarations: [
    SilkSpecInputComponent,
  ],
  imports: [
    SharedModule,
  ],
  exports: [
    SilkSpecInputComponent,
  ],
})
export class SilkSpecInputComponentModule {
}
