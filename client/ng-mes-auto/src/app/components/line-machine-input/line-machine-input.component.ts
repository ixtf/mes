import {FocusMonitor} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, NgModule, OnDestroy, OnInit, Optional, Self, ViewChild} from '@angular/core';
import {ControlValueAccessor, FormBuilder, NgControl, Validators} from '@angular/forms';
import {MatFormFieldControl} from '@angular/material';
import {combineLatest, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, switchMap} from 'rxjs/operators';
import {isString} from 'util';
import {LineMachine} from '../../models/line-machine';
import {ApiService} from '../../services/api.service';
import {displayWithLine, entityValidator, SEARCH_DEBOUNCE_TIME} from '../../services/util.service';
import {SharedModule} from '../../shared.module';

@Component({
  selector: 'app-line-machine-input',
  templateUrl: './line-machine-input.component.html',
  styleUrls: ['./line-machine-input.component.less'],
  providers: [
    {provide: MatFormFieldControl, useExisting: LineMachineInputComponent},
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineMachineInputComponent implements ControlValueAccessor, MatFormFieldControl<LineMachine>, OnInit, OnDestroy {
  static nextId = 0;
  @HostBinding()
  readonly id = `line-machine-input-${LineMachineInputComponent.nextId++}`;
  @HostBinding('attr.aria-describedby')
  describedBy = '';
  @ViewChild('itemInput', {static: true})
  readonly test: any;
  readonly stateChanges = new Subject<void>();
  readonly displayWithLine = displayWithLine;
  focused = false;
  form = this.fb.group({
    id: null,
    line: [null, [entityValidator]],
    item: [null, [Validators.min(1)]],
  }, {validators: [entityValidator]});
  readonly lineCtrl = this.form.get('line');
  readonly itemCtrl = this.form.get('item');
  autoCompleteLines$ = this.lineCtrl.valueChanges.pipe(
    filter(it => it && isString(it) && it.trim().length > 0),
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
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  // tslint:disable-next-line:variable-name
  private _disabled = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.form.disable() : this.form.enable();
    this.stateChanges.next();
  }

  // tslint:disable-next-line:variable-name
  private _placeholder: string;

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }

  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }

  // tslint:disable-next-line:variable-name
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
    const {value: {line, item}} = this.form;
    return !line && !item;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  get errorState(): boolean {
    if (this.disabled) {
      return false;
    }
    return !!this.form.errors;
  }

  @Input()
  get value(): LineMachine | null {
    const {value: {id}} = this.form;
    return (id && !this.form.errors) ? this.form.value : null;
  }

  set value(lineMachine: LineMachine | null) {
    this.form.patchValue(lineMachine || new LineMachine());
    this.stateChanges.next();
  }

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => this.onChange(this.value));
    const lineMachines$ = this.lineCtrl.valueChanges.pipe(
      filter(it => it && it.id),
      map(it => it.id),
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      switchMap(it => this.api.getLine_LineMachines(it)),
    );
    combineLatest([this.itemCtrl.valueChanges, lineMachines$]).pipe(
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      filter(([item, lineMachines]) => {
        const lineMachine = lineMachines.find(it => it.item === item);
        const id = lineMachine && lineMachine.id;
        if (this.form.value.id === id) {
          return false;
        }
        if (id) {
          this.form.patchValue(lineMachine);
        } else {
          this.form.patchValue({id});
        }
        this.stateChanges.next();
        return false;
      }),
    ).subscribe();
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

  writeValue(obj: LineMachine | null): void {
    this.value = obj;
  }

  private onChange = (_: any) => {
  };

  private onTouched = () => {
  };

}


@NgModule({
  declarations: [
    LineMachineInputComponent,
  ],
  imports: [
    SharedModule,
  ],
  exports: [
    LineMachineInputComponent
  ]
})
export class LineMachineInputComponentModule {
}
