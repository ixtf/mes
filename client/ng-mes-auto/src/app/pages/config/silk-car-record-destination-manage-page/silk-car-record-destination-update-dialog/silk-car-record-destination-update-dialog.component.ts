import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {SilkCarRecordDestination} from '../../../../models/silk-car-record-destination';
import {ApiService} from '../../../../services/api.service';

@Component({
  templateUrl: './silk-car-record-destination-update-dialog.component.html',
  styleUrls: ['./silk-car-record-destination-update-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkCarRecordDestinationUpdateDialogComponent implements OnInit {
  readonly title: string;
  readonly form = this.fb.group({
    id: null,
    name: [null, Validators.required],
  });

  constructor(private store: Store,
              private fb: FormBuilder,
              private api: ApiService,
              private dialogRef: MatDialogRef<SilkCarRecordDestinationUpdateDialogComponent, SilkCarRecordDestination>,
              @Inject(MAT_DIALOG_DATA) private silkCarRecordDestination: SilkCarRecordDestination) {
    this.title = 'Common.' + (this.silkCarRecordDestination.id ? 'edit' : 'new');
  }

  static open(dialog: MatDialog, data: SilkCarRecordDestination): Observable<SilkCarRecordDestination> {
    return dialog.open(SilkCarRecordDestinationUpdateDialogComponent, {data, disableClose: true, width: '500px'})
      .afterClosed().pipe(filter(it => it));
  }

  ngOnInit(): void {
    this.form.patchValue(this.silkCarRecordDestination);
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

}
