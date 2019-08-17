import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {ToDtyConfirmEvent} from '../../../models/event-source';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';
import {ApiService} from '../../../services/api.service';
import {COMPARE_WITH_ID} from '../../../services/util.service';

@Component({
  templateUrl: './to-dty-confirm-event-dialog.component.html',
  styleUrls: ['./to-dty-confirm-event-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToDtyConfirmEventDialogComponent implements OnInit, OnDestroy {
  readonly compareWithId = COMPARE_WITH_ID;
  readonly destinations$ = this.api.listSilkCarRecordDestination().pipe();
  readonly form = this.fb.group({
    silkCarRecord: [null, Validators.required],
    destination: [null, Validators.required],
  });

  constructor(private fb: FormBuilder,
              private api: ApiService,
              private dialogRef: MatDialogRef<ToDtyConfirmEventDialogComponent, ToDtyConfirmEvent>,
              @Inject(MAT_DIALOG_DATA) private  data: SilkCarRuntime) {
  }

  static open(dialog: MatDialog, data: SilkCarRuntime): MatDialogRef<ToDtyConfirmEventDialogComponent, ToDtyConfirmEvent> {
    return dialog.open(ToDtyConfirmEventDialogComponent, {data, disableClose: true, width: '500px'});
  }

  ngOnInit(): void {
    const {silkCarRecord} = this.data;
    this.form.patchValue({silkCarRecord});
  }

  ngOnDestroy(): void {
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

}
