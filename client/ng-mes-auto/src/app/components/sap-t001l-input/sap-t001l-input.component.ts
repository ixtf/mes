import {FocusMonitor} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, NgModule, OnDestroy, OnInit, Optional, Self, ViewChild} from '@angular/core';
import {ControlValueAccessor, FormControl, NgControl, Validators} from '@angular/forms';
import {MatFormFieldControl} from '@angular/material';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, switchMap} from 'rxjs/operators';
import {Line} from '../../models/line';
import {ApiService} from '../../services/api.service';
import {DISPLAY_WITH_LINE, SEARCH_DEBOUNCE_TIME, VALIDATORS} from '../../services/util.service';
import {SharedModule} from '../../shared.module';

@Component({
  selector: 'app-sap-t001l-input',
  templateUrl: './sap-t001l-input.component.html',
  styleUrls: ['./sap-t001l-input.component.less'],
  providers: [
    {provide: MatFormFieldControl, useExisting: SapT001lInputComponent},
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SapT001lInputComponent implements ControlValueAccessor, MatFormFieldControl<Line>, OnInit, OnDestroy {
  static nextId = 0;
  @HostBinding()
  readonly id = `line-machine-input-${SapT001lInputComponent.nextId++}`;
  @HostBinding('attr.aria-describedby')
  describedBy = '';
  @ViewChild('itemInput', {static: true})
  readonly test: any;
  readonly stateChanges = new Subject<void>();
  readonly displayWithLine = DISPLAY_WITH_LINE;
  focused = false;
  readonly lineCtrl = new FormControl(null, {validators: [Validators.required, VALIDATORS.isEntity]});
  autoCompleteLines$ = this.lineCtrl.valueChanges.pipe(
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
    this._disabled ? this.lineCtrl.disable() : this.lineCtrl.enable();
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
    return !this.lineCtrl.value;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  get errorState(): boolean {
    if (this.disabled) {
      return false;
    }
    return !!this.lineCtrl.errors;
  }

  @Input()
  get value(): Line | null {
    return this.errorState ? null : this.lineCtrl.value;
  }

  set value(line: Line | null) {
    this.lineCtrl.patchValue(line);
    this.stateChanges.next();
  }

  ngOnInit(): void {
    this.lineCtrl.valueChanges.subscribe(() => this.onChange(this.value));
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
    this.focusMonitor.stopMonitoring(this.elementRef);
  }

  onContainerClick(event: MouseEvent): void {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this.elementRef.nativeElement.querySelector('input')!.focus();
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

  writeValue(obj: Line | null): void {
    this.value = obj;
  }

  private onChange = (_: any) => {
  };

  private onTouched = () => {
  };

}


@NgModule({
  declarations: [
    SapT001lInputComponent,
  ],
  imports: [
    SharedModule,
  ],
  exports: [
    SapT001lInputComponent,
  ],
})
export class LineInputComponentModule {
}
