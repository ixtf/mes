import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {AbstractControl, FormBuilder, ValidationErrors, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {merge, Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, takeUntil, tap} from 'rxjs/operators';
import {Batch} from '../../../models/batch';
import {Grade} from '../../../models/grade';
import {PackageBox} from '../../../models/package-box';
import {SapT001l} from '../../../models/sapT001l';
import {Workshop} from '../../../models/workshop';
import {ApiService} from '../../../services/api.service';
import {COMPARE_WITH_ID, SEARCH_DEBOUNCE_TIME, SORT_BY_COMPARE} from '../../../services/util.service';

@Component({
  templateUrl: './package-box-create-dialog.component.html',
  styleUrls: ['./package-box-create-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageBoxCreateDialogComponent {
  readonly compareWithId = COMPARE_WITH_ID;
  readonly palletTypes$ = this.api.palletTypes();
  readonly packageTypes$ = this.api.packageTypes();
  readonly foamTypes$ = this.api.foamTypes();
  readonly workshop: Workshop;
  readonly packageClasses$ = this.api.listPackageClass();
  readonly grades$ = this.api.listGrade().pipe(map(it => it.sort(SORT_BY_COMPARE)));
  readonly sapT001ls$: Observable<SapT001l[]>;
  readonly form = this.fb.group({
    id: null,
    type: ['MANUAL_APPEND', Validators.required],
    batch: [null, [(ctrl: AbstractControl): ValidationErrors => {
      const value: Batch = ctrl.value;
      if (!value) {
        return {required: true};
      }
      if (value.workshop.id !== this.workshop.id) {
        return {workshop: true};
      }
      return null;
    }]],
    grade: [null, Validators.required],
    silkCount: [null, [Validators.required, Validators.min(1)]],
    netWeight: [null, [Validators.required, Validators.min(1)]],
    grossWeight: [null, [Validators.required, Validators.min(1)]],
    budat: [null, Validators.required],
    budatClass: [null, Validators.required],
    saleType: [null, Validators.required],
    sapT001l: [null, Validators.required],
    palletType: [null, Validators.required],
    packageType: [null, Validators.required],
    foamType: [null, Validators.required],
    foamNum: [null, Validators.min(1)],
    palletCode: null,
  });

  constructor(private fb: FormBuilder,
              private api: ApiService,
              private dialogRef: MatDialogRef<PackageBoxCreateDialogComponent, PackageBox>,
              @Inject(MAT_DIALOG_DATA) data: { packageBox: PackageBox; workshop: Workshop }) {
    this.workshop = data.workshop;
    this.form.patchValue(data.packageBox);
    this.sapT001ls$ = merge(this.form.get('palletCode').valueChanges, this.form.get('saleType').valueChanges).pipe(
      map(() => {
        const {sapT001ls, sapT001lsForeign, sapT001lsPallet} = this.workshop;
        const palletCode = this.form.get('palletCode').value;
        if (palletCode) {
          return sapT001lsPallet;
        }
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
    merge(this.form.get('batch').valueChanges, this.form.get('grade').valueChanges, this.form.get('silkCount').valueChanges, this.form.get('netWeight').valueChanges, this.form.get('grossWeight').valueChanges).pipe(
      takeUntil(this.dialogRef.afterClosed()),
      map(() => {
        const batch: Batch = this.form.get('batch').value;
        const grade: Grade = this.form.get('grade').value;
        const silkCount = this.form.get('silkCount').value;
        const netWeight = this.form.get('netWeight').value;
        const grossWeight = this.form.get('grossWeight').value;
        if (batch && grade && silkCount) {
          return [batch.id, grade.id, silkCount, netWeight, grossWeight].join();
        }
        return null;
      }),
      filter(it => !!it),
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      tap(() => {
        const batch: Batch = this.form.get('batch').value;
        const grade: Grade = this.form.get('grade').value;
        const silkCount = this.form.get('silkCount').value;
        if (grade.sortBy >= 100) {
          const netWeight = silkCount * batch.silkWeight;
          const grossWeight = netWeight + silkCount * batch.tubeWeight;
          this.form.get('netWeight').setValue(netWeight, {onlySelf: true});
          this.form.get('grossWeight').setValue(grossWeight);
        } else {
          const grossWeight = this.form.get('grossWeight').value;
          if (grossWeight) {
            const netWeight = grossWeight - silkCount * batch.tubeWeight;
            this.form.get('netWeight').setValue(netWeight);
          }
        }
      }),
    ).subscribe();
  }

  static open(dialog: MatDialog, data: { packageBox: PackageBox; workshop: Workshop }): Observable<PackageBox> {
    return dialog.open(PackageBoxCreateDialogComponent, {data, disableClose: true, width: '800px'})
      .afterClosed().pipe(filter(it => it));
  }

  save() {
    this.dialogRef.close(this.form.value);
  }
}
