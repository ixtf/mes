import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {COMPARE_WITH_ID, VALIDATORS} from 'src/app/services/util.service';
import {LineMachine} from '../../../../models/line-machine';
import {ApiService} from '../../../../services/api.service';

@Component({
  templateUrl: './line-machine-update-dialog.component.html',
  styleUrls: ['./line-machine-update-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineMachineUpdateDialogComponent {
  readonly compareWithId = COMPARE_WITH_ID;
  readonly title: string;
  readonly form = this.fb.group({
    id: null,
    line: [null, [Validators.required, VALIDATORS.isEntity]],
    item: [null, [Validators.required, Validators.min(1), VALIDATORS.isInt()]],
    spindleNum: [null, [Validators.required, Validators.min(1), VALIDATORS.isInt()]],
    spindleSeq: [null, [Validators.required, Validators.minLength(1)]],
  });

  constructor(private store: Store,
              private fb: FormBuilder,
              private api: ApiService,
              private dialogRef: MatDialogRef<LineMachineUpdateDialogComponent, LineMachine>,
              @Inject(MAT_DIALOG_DATA) data: LineMachine) {
    this.title = 'Common.' + (data.id ? 'edit' : 'new');
    this.form.patchValue(data);
  }

  static open(dialog: MatDialog, data: LineMachine): Observable<LineMachine> {
    return dialog.open(LineMachineUpdateDialogComponent, {data, disableClose: true, width: '500px'})
      .afterClosed().pipe(filter(it => it));
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

}
