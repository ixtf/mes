import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material';
import {Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {SilkCar} from '../../../../models/silk-car';

@Component({
  templateUrl: './silk-car-batch-create-dialog.component.html',
  styleUrls: ['./silk-car-batch-create-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkCarBatchCreateDialogComponent implements OnInit {
  readonly title: string;
  readonly form = this.fb.group({
    id: null,
    corporation: [null, Validators.required],
    name: ['', Validators.required],
    code: ['', Validators.required],
    note: [''],
    sapT001ls: this.fb.array([], [Validators.required, Validators.minLength(1)]),
    sapT001lsForeign: this.fb.array([], [Validators.required, Validators.minLength(1)]),
    sapT001lsPallet: this.fb.array([], [Validators.required, Validators.minLength(1)]),
  });

  constructor(private store: Store,
              private fb: FormBuilder,
              private dialogRef: MatDialogRef<SilkCarBatchCreateDialogComponent, SilkCar[]>) {
    // this.title = 'Common.' + (this.silkCar.id ? 'edit' : 'new');
  }

  static open(dialog: MatDialog): Observable<SilkCar[]> {
    return dialog.open(SilkCarBatchCreateDialogComponent, {disableClose: true, width: '500px'})
      .afterClosed().pipe(filter(it => it && it.length > 0));
  }

  ngOnInit(): void {
    // this.form.patchValue(this.silkCar);
  }

  save() {
  }

}
