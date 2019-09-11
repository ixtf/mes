import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {merge, Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {PackageBox} from '../../../models/package-box';
import {SapT001l} from '../../../models/sapT001l';
import {ApiService} from '../../../services/api.service';
import {COMPARE_WITH_ID, SORT_BY_COMPARE} from '../../../services/util.service';

@Component({
  templateUrl: './package-box-create-dialog.component.html',
  styleUrls: ['./package-box-create-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageBoxCreateDialogComponent {
  readonly title: string;
  readonly compareWithId = COMPARE_WITH_ID;
  readonly packageClasses$ = this.api.listPackageClass();
  readonly grades$ = this.api.listGrade().pipe(map(it => it.sort(SORT_BY_COMPARE)));
  readonly form = this.fb.group({
    id: null,
    type: ['MANUAL_APPEND', Validators.required],
    batch: [null, Validators.required],
    grade: [null, Validators.required],
    budat: [null, Validators.required],
    budatClass: [null, Validators.required],
    saleType: [null, Validators.required],
    sapT001l: [null, Validators.required],
  });
  readonly sapT001ls$: Observable<SapT001l[]>;

  constructor(private fb: FormBuilder,
              private api: ApiService,
              private dialogRef: MatDialogRef<PackageBoxCreateDialogComponent, PackageBox>,
              @Inject(MAT_DIALOG_DATA) private data: PackageBox) {
    this.title = 'Common.' + (this.data.id ? 'edit' : 'new');
    this.form.patchValue(this.data);
    this.sapT001ls$ = merge(this.form.get('batch').valueChanges, this.form.get('saleType').valueChanges).pipe(
      map(() => {
        const batch = this.form.get('batch').value;
        if (!batch) {
          return [];
        }
        const {workshop: {sapT001ls, sapT001lsForeign, sapT001lsPallet}} = batch;
        const saleType = this.form.get('saleType').value;
        switch (saleType) {
          case  'DOMESTIC': {
            return sapT001ls;
          }
          case 'FOREIGN': {
            return sapT001lsForeign;
          }
          default: {
            return [];
          }
        }
      }),
    );
  }

  static open(dialog: MatDialog, data: PackageBox): Observable<PackageBox> {
    return dialog.open(PackageBoxCreateDialogComponent, {data, disableClose: true, width: '800px'})
      .afterClosed().pipe(filter(it => it));
  }

  save() {
    this.dialogRef.close(this.form.value);
  }
}
