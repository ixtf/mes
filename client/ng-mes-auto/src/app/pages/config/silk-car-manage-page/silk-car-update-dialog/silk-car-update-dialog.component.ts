import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {Store} from '@ngxs/store';
import {Workshop} from '../../../../models/workshop';

@Component({
  templateUrl: './silk-car-update-dialog.component.html',
  styleUrls: ['./silk-car-update-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkCarUpdateDialogComponent implements OnInit {
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
              @Inject(MAT_DIALOG_DATA) private workshop: Workshop) {
    this.title = 'Common.' + (this.workshop.id ? 'edit' : 'new');
  }

  static open(dialog: MatDialog, data: Workshop): MatDialogRef<SilkCarUpdateDialogComponent, Workshop> {
    return dialog.open(SilkCarUpdateDialogComponent, {data, disableClose: true, width: '500px'});
  }

  ngOnInit(): void {
    this.form.patchValue(this.workshop);
  }

  save() {
  }

}
