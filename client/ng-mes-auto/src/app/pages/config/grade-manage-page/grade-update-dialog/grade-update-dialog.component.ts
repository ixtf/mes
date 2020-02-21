import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {Grade} from '../../../../models/grade';

@Component({
  templateUrl: './grade-update-dialog.component.html',
  styleUrls: ['./grade-update-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GradeUpdateDialogComponent implements OnInit {
  readonly title: string;
  readonly form = this.fb.group({
    id: [null, Validators.required],
    code: [null, Validators.required],
    name: [null, Validators.required],
    sortBy: [0, [Validators.required, Validators.min(1)]],
  });

  constructor(private store: Store,
              private fb: FormBuilder,
              private dialogRef: MatDialogRef<GradeUpdateDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private grade: Grade) {
    this.title = 'Common.' + (this.grade.id ? 'edit' : 'new');
  }

  static open(dialog: MatDialog, data: Grade): Observable<Grade> {
    return dialog.open(GradeUpdateDialogComponent, {data, disableClose: true, width: '500px'})
      .afterClosed().pipe(filter(it => it));
  }

  ngOnInit(): void {
    this.form.patchValue(this.grade);
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

}
