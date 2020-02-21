import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {Line} from '../../../models/line';
import {Notification} from '../../../models/notification';
import {ApiService} from '../../../services/api.service';
import {COMPARE_WITH_ID, SEARCH_DEBOUNCE_TIME} from '../../../services/util.service';

const workshopsLinesValidator = (control: FormControl) => {
  const workshops = control.value.workshops || [];
  const lines = control.value.lines || [];
  if (workshops.length > 0 || lines.length > 0) {
    return null;
  }
  return {workshopsLines: true};
};

@Component({
  templateUrl: './notification-update-dialog.component.html',
  styleUrls: ['./notification-update-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationUpdateDialogComponent implements OnInit, OnDestroy {
  readonly title: string;
  readonly compareWithId = COMPARE_WITH_ID;
  readonly workshops$ = this.api.listWorkshop().pipe();
  readonly lineQCtrl = new FormControl();
  readonly form = this.fb.group({
    id: null,
    workshops: null,
    lines: null,
    note: [null, [Validators.required]],
  }, {validator: [Validators.required, workshopsLinesValidator]});
  private readonly destroy$ = new Subject();
  readonly autoCompleteLines$ = this.lineQCtrl.valueChanges.pipe(
    takeUntil(this.destroy$),
    debounceTime(SEARCH_DEBOUNCE_TIME),
    distinctUntilChanged(),
    filter(it => it && (typeof it === 'string') && it.trim().length > 0),
    switchMap(q => this.api.autoCompleteLine(q)),
    map(lines => lines.filter(line => {
      const selecteds = this.form.value.lines || [];
      const find = selecteds.find(it => it.id === line.id);
      return !find;
    })),
  );

  constructor(private fb: FormBuilder,
              private api: ApiService,
              private dialogRef: MatDialogRef<NotificationUpdateDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: Notification) {
    this.title = 'Common.' + (this.data.id ? 'edit' : 'new');
  }

  static open(dialog: MatDialog, data: Notification): MatDialogRef<NotificationUpdateDialogComponent, Notification> {
    return dialog.open(NotificationUpdateDialogComponent, {data, disableClose: true, width: '500px'});
  }

  ngOnInit(): void {
    this.form.patchValue(this.data);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectedLine(ev: MatAutocompleteSelectedEvent) {
    const lines = this.form.value.lines || [];
    lines.push(ev.option.value);
    this.form.patchValue({lines});
    this.lineQCtrl.setValue('a');
  }

  removeLine(line: Line) {
    const lines = (this.form.value.lines || []).filter(it => it.id !== line.id);
    this.form.patchValue({lines});
  }

  save() {
    this.dialogRef.close(this.form.value);
  }
}
