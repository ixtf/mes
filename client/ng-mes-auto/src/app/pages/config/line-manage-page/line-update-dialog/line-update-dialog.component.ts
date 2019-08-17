import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {distinctUntilChanged, filter, map, tap} from 'rxjs/operators';
import {CODE_COMPARE, COMPARE_WITH_ID} from 'src/app/services/util.service';
import {Line} from '../../../../models/line';
import {ApiService} from '../../../../services/api.service';

@Component({
  templateUrl: './line-update-dialog.component.html',
  styleUrls: ['./line-update-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineUpdateDialogComponent {
  readonly doffingTypes = ['AUTO', 'MANUAL'];
  readonly compareWithId = COMPARE_WITH_ID;
  readonly title: string;
  readonly workshops$ = this.api.listWorkshop().pipe(map(it => it.sort(CODE_COMPARE)));
  readonly form = this.fb.group({
    id: null,
    workshop: [null, Validators.required],
    name: [null, Validators.required],
    doffingType: [this.doffingTypes[0], Validators.required],
  });

  constructor(private store: Store,
              private fb: FormBuilder,
              private api: ApiService,
              private dialogRef: MatDialogRef<LineUpdateDialogComponent, Line>,
              @Inject(MAT_DIALOG_DATA) private line: Line) {
    this.title = 'Common.' + (this.line.id ? 'edit' : 'new');
    this.form.patchValue(this.line);
    this.form.get('name').valueChanges.pipe(
      filter(it => it),
      map(it => it.toUpperCase().trim()),
      filter(it => it),
      distinctUntilChanged(),
      tap(it => this.form.get('name').patchValue(it)),
    ).subscribe();
  }

  static open(dialog: MatDialog, data: Line): Observable<Line> {
    return dialog.open(LineUpdateDialogComponent, {data, disableClose: true, width: '500px'})
      .afterClosed().pipe(filter(it => it));
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

}
