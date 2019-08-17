import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {Store} from '@ngxs/store';
import {merge, Observable} from 'rxjs';
import {filter, tap} from 'rxjs/operators';
import {COMPARE_WITH_ID, VALIDATORS} from 'src/app/services/util.service';
import {TemporaryBox} from '../../../../models/temporary-box';
import {ApiService} from '../../../../services/api.service';

@Component({
  templateUrl: './temporary-box-update-dialog.component.html',
  styleUrls: ['./temporary-box-update-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemporaryBoxUpdateDialogComponent {
  readonly title: string;
  readonly compareWithId = COMPARE_WITH_ID;
  readonly grades$ = this.api.listGrade();
  readonly form = this.fb.group({
    id: null,
    code: [null, Validators.required],
    batch: [null, [Validators.required, VALIDATORS.isEntity]],
    grade: [null, [Validators.required, VALIDATORS.isEntity]],
  });

  constructor(private store: Store,
              private fb: FormBuilder,
              private api: ApiService,
              private dialogRef: MatDialogRef<TemporaryBoxUpdateDialogComponent, TemporaryBox>,
              @Inject(MAT_DIALOG_DATA) data: TemporaryBox) {
    this.title = 'Common.' + (data.id ? 'edit' : 'new');
    this.form.patchValue(data);
    merge(this.form.get('batch').valueChanges, this.form.get('grade').valueChanges).pipe(
      tap(() => {
        const batch = this.form.get('batch').value;
        const grade = this.form.get('grade').value;
        this.form.get('code').patchValue(`${batch.batchNo}${grade.name}`);
      }),
    ).subscribe();
  }

  static open(dialog: MatDialog, data: TemporaryBox): Observable<TemporaryBox> {
    return dialog.open(TemporaryBoxUpdateDialogComponent, {data, disableClose: true, width: '500px'})
      .afterClosed().pipe(filter(it => it));
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

}
