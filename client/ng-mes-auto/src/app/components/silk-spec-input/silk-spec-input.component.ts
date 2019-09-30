/* tslint:disable:semicolon */
import {FocusMonitor} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostBinding, Input, NgModule, OnDestroy, OnInit, Optional, Output, Self} from '@angular/core';
import {ControlValueAccessor, FormControl, NgControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatFormFieldControl} from '@angular/material';
import {Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {Line} from '../../models/line';
import {LineMachine} from '../../models/line-machine';
import {Workshop} from '../../models/workshop';
import {ApiService} from '../../services/api.service';
import {CODE_COMPARE} from '../../services/util.service';
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
  @Output()
  readonly optionSelected = new EventEmitter<MatAutocompleteSelectedEvent>();
  @HostBinding()
  readonly id = `batch-input-${SilkSpecInputComponent.nextId++}`;
  @HostBinding('attr.aria-describedby')
  describedBy = '';
  readonly stateChanges = new Subject<void>();
  readonly valueCtrl = new FormControl();
  focused = false;
  readonly workshops$ = this.api.listWorkshop().pipe(map(it => it.sort(CODE_COMPARE)));

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
    return !this.valueCtrl.value;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  get errorState(): boolean {
    if (this.disabled) {
      return false;
    }
    return false;
  }

  @Input()
  get value(): SilkSpec | null {
    if (this.errorState) {
      return null;
    }
    return this.valueCtrl.value;
  }

  set value(silkSpec: SilkSpec | null) {
    this.valueCtrl.patchValue(silkSpec);
    this.stateChanges.next();
  }

  ngOnInit(): void {
    this.valueCtrl.valueChanges.subscribe(() => this.onChange(this.value));
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

  writeValue(obj: SilkSpec | null): void {
    this.value = obj;
  }

  lines$(workshop: Workshop): Observable<Line[]> {
    return this.api.getWorkshop_Lines(workshop.id);
  }

  lineMachines$(line: Line): Observable<LineMachine[]> {
    return this.api.getLine_LineMachines(line.id);
  }

  lineMachineItems$(lineMachine: LineMachine): number[] {
    return Array(lineMachine.spindleNum).fill(null).map((x, i) => i);
  }

  test(lineMachine: LineMachine, spindle: number) {
    this.valueCtrl.patchValue(new SilkSpec(lineMachine, spindle));
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
