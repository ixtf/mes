import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {Subject} from 'rxjs';
import {distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {ExceptionRecord} from '../../../models/exception-record';
import {ApiService} from '../../../services/api.service';
import {compareWithId} from '../../../services/util.service';

@Component({
  templateUrl: './exception-record-update-dialog.component.html',
  styleUrls: ['./exception-record-update-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExceptionRecordUpdateDialogComponent implements OnInit, OnDestroy {
  readonly compareWithId = compareWithId;
  readonly form = this.fb.group({
    id: null,
    lineMachine: [null, [Validators.required]],
    spindle: [null, [Validators.required, Validators.min(1)]],
    doffingNum: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(3)]],
    exception: [null, Validators.required],
    silk: null,
  });
  readonly title: string;
  private readonly destroy$ = new Subject();
  readonly silkExceptions$ = this.api.listSilkException();

  constructor(private fb: FormBuilder,
              private api: ApiService,
              private dialogRef: MatDialogRef<ExceptionRecordUpdateDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: ExceptionRecord) {
    this.title = 'Common.' + (this.data.id ? 'edit' : 'new');
  }

  static open(dialog: MatDialog, data: ExceptionRecord): MatDialogRef<ExceptionRecordUpdateDialogComponent, ExceptionRecord> {
    return dialog.open(ExceptionRecordUpdateDialogComponent, {data, disableClose: true, width: '500px'});
  }

  ngOnInit(): void {
    this.form.patchValue(this.data);
    if (this.data.silk) {
      this.form.disable();
      this.form.get('exception').enable();
    }
    this.form.get('doffingNum').valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
    ).subscribe(it => {
      const doffingNum = (it || '').toUpperCase().trim();
      this.form.patchValue({doffingNum});
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

}
