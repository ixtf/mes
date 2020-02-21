import {FocusMonitor} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostBinding, Input, NgModule, OnDestroy, OnInit, Optional, Output, Self} from '@angular/core';
import {ControlValueAccessor, FormControl, NgControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatFormFieldControl} from '@angular/material/form-field';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, switchMap} from 'rxjs/operators';
import {Line} from '../../models/line';
import {ApiService} from '../../services/api.service';
import {DISPLAY_WITH_LINE, SEARCH_DEBOUNCE_TIME, VALIDATORS} from '../../services/util.service';
import {SharedModule} from '../../shared.module';

@Component({
  selector: 'app-line-input',
  templateUrl: './line-input.component.html',
  styleUrls: ['./line-input.component.less'],
  providers: [
    {provide: MatFormFieldControl, useExisting: LineInputComponent},
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineInputComponent implements ControlValueAccessor, MatFormFieldControl<Line>, OnInit, OnDestroy {
  static nextId = 0;
  @Output()
  readonly optionSelected = new EventEmitter<MatAutocompleteSelectedEvent>();
  @HostBinding()
  readonly id = `line-input-${LineInputComponent.nextId++}`;
  @HostBinding('attr.aria-describedby')
  describedBy = '';
  readonly stateChanges = new Subject<void>();
  readonly displayWithLine = DISPLAY_WITH_LINE;
  focused = false;
  readonly qCtrl = new FormControl(null, {validators: [VALIDATORS.isEntity]});
  readonly autoData$ = this.qCtrl.valueChanges.pipe(
    filter(it => it && (typeof it === 'string') && (it.trim().length > 0)),
    debounceTime(SEARCH_DEBOUNCE_TIME),
    distinctUntilChanged(),
    switchMap(q => this.api.autoCompleteLine(q)),
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
    if (this.ngControl != null) {
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
  get value(): Line | null {
    return this.errorState ? null : this.qCtrl.value;
  }

  set value(line: Line | null) {
    this.qCtrl.patchValue(line);
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

  writeValue(obj: Line | string): void {
    if (typeof obj === 'string') {
      this.api.getLine(obj as string).subscribe(it => this.value = it);
    } else {
      this.value = obj as Line;
    }
  }

  private onChange = (_: any) => {
  };

  private onTouched = () => {
  };
}


@NgModule({
  declarations: [
    LineInputComponent,
  ],
  imports: [
    SharedModule,
  ],
  exports: [
    LineInputComponent,
  ],
})
export class LineInputComponentModule {
}
