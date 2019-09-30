import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {Observable, throwError} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, takeUntil, tap} from 'rxjs/operators';
import {Batch} from '../../../models/batch';
import {Grade} from '../../../models/grade';
import {PackageBox} from '../../../models/package-box';
import {PackageClass} from '../../../models/package-class';
import {Workshop} from '../../../models/workshop';
import {ApiService} from '../../../services/api.service';
import {COMPARE_WITH_ID, SEARCH_DEBOUNCE_TIME} from '../../../services/util.service';

@Component({
  templateUrl: './package-box-batch-measure-dialog.component.html',
  styleUrls: ['./package-box-batch-measure-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageBoxBatchMeasureDialogComponent {
  readonly compareWithId = COMPARE_WITH_ID;
  readonly workshop: Workshop;
  readonly hasPalletCode: boolean;
  readonly batch: Batch;
  readonly grade: Grade;
  readonly packageBoxes: PackageBox[];
  readonly palletTypes$ = this.api.palletTypes();
  readonly packageTypes$ = this.api.packageTypes();
  readonly foamTypes$ = this.api.foamTypes();
  readonly packageClasses$ = this.api.listPackageClass();
  readonly form = this.fb.group({
    budat: [null, Validators.required],
    budatClass: [null, Validators.required],
    batch: [{value: null, disabled: true}, Validators.required],
    grade: [{value: null, disabled: true}, Validators.required],
    saleType: [null, Validators.required],
    sapT001l: [null, Validators.required],
    palletType: [null, Validators.required],
    packageType: [null, Validators.required],
    foamType: [null, Validators.required],
    foamNum: [null, Validators.min(1)],
  });
  readonly sapT001ls$ = this.saleTypeCtrl.valueChanges.pipe(
    takeUntil(this.dialogRef.afterClosed()),
    debounceTime(SEARCH_DEBOUNCE_TIME),
    distinctUntilChanged(),
    map(saleType => {
      if (this.hasPalletCode) {
        return this.workshop.sapT001lsPallet;
      }
      return PackageBox.sapT001ls({saleType, workshop: this.workshop});
    }),
    tap(sapT001ls => {
      if (sapT001ls && sapT001ls.length === 1) {
        this.sapT001lCtrl.setValue(sapT001ls[0]);
      } else {
        const oldId = this.sapT001lCtrl.value && this.sapT001lCtrl.value.id;
        const find = (sapT001ls || []).find(it => it.id === oldId);
        this.sapT001lCtrl.setValue(find);
      }
    }),
  );

  constructor(private fb: FormBuilder,
              private api: ApiService,
              private dialogRef: MatDialogRef<PackageBoxBatchMeasureDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: { workshop: Workshop; budat: Date; budatClass: PackageClass; batch: Batch; grade: Grade; packageBoxes: PackageBox[]; hasPalletCode: boolean }) {
    const {workshop, budat, budatClass, batch, grade, packageBoxes, hasPalletCode} = data;
    this.workshop = workshop;
    this.hasPalletCode = hasPalletCode;
    this.batch = batch;
    this.grade = grade;
    this.packageBoxes = packageBoxes;
    this.form.patchValue({budat, budatClass});
  }

  get sapT001lCtrl(): AbstractControl {
    return this.form.get('sapT001l');
  }

  get saleTypeCtrl(): AbstractControl {
    return this.form.get('saleType');
  }

  get batchCtrl(): AbstractControl {
    return this.form.get('batch');
  }

  get gradeCtrl(): AbstractControl {
    return this.form.get('grade');
  }

  static open(dialog: MatDialog, data: { workshop: Workshop; budat: Date; budatClass: PackageClass; packageBoxes: PackageBox[] }): Observable<PackageBox[]> {
    const check = PackageBoxBatchMeasureDialogComponent.check(data.packageBoxes);
    if (check) {
      const {batch, grade, palletCode} = data.packageBoxes[0];
      data = Object.assign(data, {batch, grade, hasPalletCode: PackageBox.isValidPalletCode(palletCode)});
      return dialog.open(PackageBoxBatchMeasureDialogComponent, {data, disableClose: true, minWidth: '800px'})
        .afterClosed().pipe(filter(it => it && it.length > 0));
    } else {
      return throwError('Validator.batchMeasureError');
    }
  }

  static check(packageBoxes: PackageBox[]): boolean {
    const batchMap = {};
    const gradeMap = {};
    const palletCodeCheckSet = new Set();
    packageBoxes.forEach(packageBox => {
      batchMap[packageBox.batch.id] = packageBox.batch;
      gradeMap[packageBox.grade.id] = packageBox.grade;
      palletCodeCheckSet.add(PackageBox.isValidPalletCode(packageBox.palletCode));
    });
    const batches = Object.values(batchMap);
    const grades = Object.values(gradeMap);
    return batches.length === 1 && grades.length === 1 && palletCodeCheckSet.size === 1;
  }

  save() {
    const packageBoxes = this.packageBoxes.map(packageBox => {
      return PackageBox.assign(packageBox, this.form.value);
    });
    this.dialogRef.close(packageBoxes);
  }
}
