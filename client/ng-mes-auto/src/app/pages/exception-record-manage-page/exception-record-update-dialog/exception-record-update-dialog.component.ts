import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material';
import {ExceptionRecord} from '../../../models/exception-record';
import {ApiService} from '../../../services/api.service';

@Component({
  templateUrl: './exception-record-update-dialog.component.html',
  styleUrls: ['./exception-record-update-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExceptionRecordUpdateDialogComponent implements OnInit {
  readonly title: string;
  readonly form = this.fb.group({
    id: null,
    lineMachine: [null, Validators.required],
    exception: [null, Validators.required],
    spindle: [null, [Validators.required, Validators.min(1)]],
    doffingNum: [null, [Validators.required]],
  });
  readonly silkExceptions$ = this.api.listSilkException();

  constructor(private fb: FormBuilder,
              private api: ApiService,
              @Inject(MAT_DIALOG_DATA) private data: ExceptionRecord) {
    this.title = 'Common.' + (this.data.id ? 'edit' : 'new');
  }

  ngOnInit(): void {
    this.form.patchValue(this.data);
  }

  update() {
  }

}
