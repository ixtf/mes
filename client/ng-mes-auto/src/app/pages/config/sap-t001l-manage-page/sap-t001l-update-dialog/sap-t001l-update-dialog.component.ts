import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {SapT001l} from '../../../../models/sapT001l';

@Component({
  templateUrl: './sap-t001l-update-dialog.component.html',
  styleUrls: ['./sap-t001l-update-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SapT001lUpdateDialogComponent implements OnInit {
  readonly title: string;
  readonly form = this.fb.group({
    lgort: [null, Validators.required],
    lgobe: [null, Validators.required],
  });

  constructor(private store: Store,
              private fb: FormBuilder,
              private dialogRef: MatDialogRef<SapT001lUpdateDialogComponent, SapT001l>,
              @Inject(MAT_DIALOG_DATA) private sapT001l: SapT001l) {
    this.title = 'Common.' + (this.sapT001l.id ? 'edit' : 'new');
  }

  static open(dialog: MatDialog, data: SapT001l): Observable<SapT001l> {
    return dialog.open(SapT001lUpdateDialogComponent, {data, disableClose: true, width: '500px'})
      .afterClosed().pipe(filter(it => it));
  }

  ngOnInit(): void {
    this.form.patchValue(this.sapT001l);
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

}
