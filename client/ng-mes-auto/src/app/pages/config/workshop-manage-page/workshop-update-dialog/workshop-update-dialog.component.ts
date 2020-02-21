import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {Workshop} from '../../../../models/workshop';
import {ApiService} from '../../../../services/api.service';
import {COMPARE_WITH_ID} from '../../../../services/util.service';

@Component({
  templateUrl: './workshop-update-dialog.component.html',
  styleUrls: ['./workshop-update-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkshopUpdateDialogComponent implements OnInit {
  readonly compareWithId = COMPARE_WITH_ID;
  readonly sapT001ls$ = this.api.listSapT001l();
  readonly title: string;
  readonly form = this.fb.group({
    id: null,
    corporation: [null, Validators.required],
    name: [null, Validators.required],
    code: [null, Validators.required],
    note: null,
    sapT001ls: [null, [Validators.required, Validators.minLength(1)]],
    sapT001lsForeign: [null, [Validators.required, Validators.minLength(1)]],
    sapT001lsPallet: [null, [Validators.required, Validators.minLength(1)]],
  });

  constructor(private store: Store,
              private fb: FormBuilder,
              private api: ApiService,
              private dialogRef: MatDialogRef<WorkshopUpdateDialogComponent, Workshop>,
              @Inject(MAT_DIALOG_DATA) private workshop: Workshop) {
    this.title = 'Common.' + (this.workshop.id ? 'edit' : 'new');
  }

  static open(dialog: MatDialog, data: Workshop): Observable<Workshop> {
    return dialog.open(WorkshopUpdateDialogComponent, {data, disableClose: true, width: '500px'})
      .afterClosed().pipe(filter(it => it));
  }

  ngOnInit(): void {
    this.form.patchValue(this.workshop);
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

}
