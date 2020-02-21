import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngxs/store';
import {merge, Observable} from 'rxjs';
import {distinctUntilChanged, filter, map, tap} from 'rxjs/operators';
import {CODE_COMPARE, COMPARE_WITH_ID} from 'src/app/services/util.service';
import {Batch} from '../../../../models/batch';
import {ApiService} from '../../../../services/api.service';

@Component({
  templateUrl: './batch-update-dialog.component.html',
  styleUrls: ['./batch-update-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatchUpdateDialogComponent {
  readonly title: string;
  readonly compareWithId = COMPARE_WITH_ID;
  readonly workshops$ = this.api.listWorkshop().pipe(map(it => it.sort(CODE_COMPARE)));
  readonly products$ = this.api.listProduct();
  readonly form = this.fb.group({
    id: null,
    workshop: [null, Validators.required],
    product: [null, Validators.required],
    batchNo: [null, Validators.required],
    centralValue: [null, [Validators.required, Validators.min(1)]],
    holeNum: [null, [Validators.required, Validators.min(1)]],
    spec: [null, Validators.required],
    tubeColor: [null, Validators.required],
    tubeWeight: [null, [Validators.required, Validators.min(0)]],
    silkWeight: [null, [Validators.required, Validators.min(1)]],
    multiDyeing: false,
    note: null,
  });

  constructor(private store: Store,
              private fb: FormBuilder,
              private api: ApiService,
              private dialogRef: MatDialogRef<BatchUpdateDialogComponent, Batch>,
              @Inject(MAT_DIALOG_DATA) batch: Batch) {
    this.title = 'Common.' + (batch.id ? 'edit' : 'new');
    this.form.patchValue(batch);
    merge(this.form.get('centralValue').valueChanges, this.form.get('holeNum').valueChanges).pipe(
      tap(() => {
        const centralValue = this.form.get('centralValue').value;
        const holeNum = this.form.get('holeNum').value;
        this.form.get('spec').patchValue(`${centralValue}dtex/${holeNum}f`);
      }),
    ).subscribe();
    this.form.get('batchNo').valueChanges.pipe(
      filter(it => it),
      map(it => it.toUpperCase().trim()),
      filter(it => it),
      distinctUntilChanged(),
      tap(it => this.form.get('batchNo').patchValue(it)),
    ).subscribe();
  }

  static open(dialog: MatDialog, data: Batch): Observable<Batch> {
    return dialog.open(BatchUpdateDialogComponent, {data, disableClose: true, width: '500px'})
      .afterClosed().pipe(filter(it => it));
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

}
