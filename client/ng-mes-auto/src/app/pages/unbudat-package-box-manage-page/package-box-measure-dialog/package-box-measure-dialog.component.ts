import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatAutocompleteSelectedEvent, MatDialog, MatDialogRef} from '@angular/material';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, switchMap} from 'rxjs/operators';
import {isString} from 'util';
import {Line} from '../../../models/line';
import {PackageBox} from '../../../models/package-box';
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
  templateUrl: './package-box-measure-dialog.component.html',
  styleUrls: ['./package-box-measure-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageBoxMeasureDialogComponent {
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
  readonly autoCompleteLines$ = this.lineQCtrl.valueChanges.pipe(
    debounceTime(SEARCH_DEBOUNCE_TIME),
    distinctUntilChanged(),
    filter(it => it && isString(it) && it.trim().length > 0),
    switchMap(q => this.api.autoCompleteLine(q)),
    map(lines => lines.filter(line => {
      const selecteds = this.form.value.lines || [];
      const find = selecteds.find(it => it.id === line.id);
      return !find;
    })),
  );

  constructor(private fb: FormBuilder,
              private api: ApiService,
              private dialogRef: MatDialogRef<PackageBoxMeasureDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: PackageBox) {
    this.title = 'Common.' + (this.data.id ? 'edit' : 'new');
    this.form.patchValue(this.data);
  }

  static open(dialog: MatDialog, data: PackageBox): Observable<PackageBox> {
    return dialog.open(PackageBoxMeasureDialogComponent, {data, disableClose: true, width: '500px'})
      .afterClosed().pipe(filter(it => it));
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
