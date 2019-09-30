/* tslint:disable:no-eval */
import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {merge, Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, takeUntil, tap} from 'rxjs/operators';
import {Batch} from '../../../models/batch';
import {Grade} from '../../../models/grade';
import {PackageBox} from '../../../models/package-box';
import {Workshop} from '../../../models/workshop';
import {ApiService} from '../../../services/api.service';
import {COMPARE_WITH_ID, SEARCH_DEBOUNCE_TIME, SORT_BY_COMPARE} from '../../../services/util.service';

@Component({
  templateUrl: './package-box-measure-dialog.component.html',
  styleUrls: ['./package-box-measure-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageBoxMeasureDialogComponent {
  readonly compareWithId = COMPARE_WITH_ID;
  readonly workshop: Workshop;
  readonly packageBox: PackageBox;
  readonly palletTypes$ = this.api.palletTypes();
  readonly packageTypes$ = this.api.packageTypes();
  readonly foamTypes$ = this.api.foamTypes();
  readonly packageClasses$ = this.api.listPackageClass();
  readonly grades$ = this.api.listGrade().pipe(map(it => it.sort(SORT_BY_COMPARE)));
  readonly form = this.fb.group({
    id: null,
    budat: [null, Validators.required],
    budatClass: [null, Validators.required],
    batch: [{value: null, disabled: true}, Validators.required],
    grade: [{value: null, disabled: true}, Validators.required],
    silkCount: [{value: null, disabled: true}, [Validators.required, Validators.min(1)]],
    netWeight: [{value: null, disabled: true}, [Validators.required, Validators.min(1)]],
    grossWeight: [{value: null, disabled: true}, [Validators.required, Validators.min(1)]],
    saleType: [null, Validators.required],
    sapT001l: [null, Validators.required],
    palletType: [null, Validators.required],
    packageType: [null, Validators.required],
    foamType: [null, Validators.required],
    foamNum: [null, Validators.min(1)],
    palletCode: null,
  });
  readonly sapT001ls$ = merge(this.saleTypeCtrl.valueChanges, this.palletCodeCtrl.valueChanges).pipe(
    takeUntil(this.dialogRef.afterClosed()),
    debounceTime(SEARCH_DEBOUNCE_TIME),
    distinctUntilChanged(),
    map(() => {
      const saleType = this.saleTypeCtrl.value;
      const palletCode = this.palletCodeCtrl.value;
      return PackageBox.sapT001ls({saleType, workshop: this.workshop, palletCode});
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
              private dialogRef: MatDialogRef<PackageBoxMeasureDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: { workshop: Workshop; packageBox: PackageBox; }) {
    const {workshop, packageBox} = data;
    this.workshop = workshop;
    this.packageBox = packageBox;
    merge(this.batchCtrl.valueChanges, this.gradeCtrl.valueChanges, this.silkCountCtrl.valueChanges, this.grossWeightCtrl.valueChanges).pipe(
      takeUntil(this.dialogRef.afterClosed()),
      map(() => {
        const batch: Batch = this.batchCtrl.value;
        const grade: Grade = this.gradeCtrl.value;
        const silkCount = this.silkCountCtrl.value;
        const netWeight = this.netWeightCtrl.value;
        const grossWeight = this.grossWeightCtrl.value;
        if (batch && grade && silkCount) {
          return [batch.id, grade.id, silkCount, netWeight, grossWeight].join();
        }
        return null;
      }),
      filter(it => !!it),
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      tap(() => {
        const {netWeight, grossWeight} = this.weightFormula;
        if (netWeight) {
          this.netWeightCtrl.setValue(eval(netWeight));
        }
        if (grossWeight) {
          this.grossWeightCtrl.setValue(eval(grossWeight));
        }
      }),
    ).subscribe();
    if (this.packageBox.type === 'AUTO') {
      this.configAuto();
    } else if (this.packageBox.type === 'MANUAL_APPEND') {
      this.configAppend();
    } else if (this.packageBox.grade.sortBy >= 100) {
      this.configManual100();
    } else {
      this.configManual();
    }
    this.form.patchValue(this.packageBox);
  }

  get sapT001lCtrl(): AbstractControl {
    return this.form.get('sapT001l');
  }

  get palletCodeCtrl(): AbstractControl {
    return this.form.get('palletCode');
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

  get silkCountCtrl(): AbstractControl {
    return this.form.get('silkCount');
  }

  get netWeightCtrl(): AbstractControl {
    return this.form.get('netWeight');
  }

  get grossWeightCtrl(): AbstractControl {
    return this.form.get('grossWeight');
  }

  get weightFormula(): { netWeight: string; grossWeight?: string } {
    const batch: Batch = this.batchCtrl.value;
    const grade: Grade = this.gradeCtrl.value;
    const silkCount = this.silkCountCtrl.value;
    const grossWeight = this.grossWeightCtrl.value;
    return PackageBox.weightFormula({batch, grade, silkCount, grossWeight});
  }

  static open(dialog: MatDialog, data: { workshop: Workshop; packageBox: PackageBox; }): Observable<PackageBox> {
    return dialog.open(PackageBoxMeasureDialogComponent, {data, disableClose: true, minWidth: '800px'})
      .afterClosed().pipe(filter(it => it));
  }

  /**
   * 自动线打包
   */
  private configAuto() {
  }

  /**
   * 人工打包 定重
   */
  private configAppend() {
  }

  /**
   * 人工打包 定重
   */
  private configManual100() {
  }

  /**
   * 人工打包 等级品
   */
  private configManual() {
    this.form.get('grossWeight').enable();
    this.form.get('grossWeight').valueChanges.pipe(
      takeUntil(this.dialogRef.afterClosed()),
      filter(it => it),
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      tap(grossWeight => {
        const batch: Batch = this.form.get('batch').value;
        const silkCount = this.form.get('silkCount').value;
        const netWeight = grossWeight - silkCount * batch.tubeWeight;
        this.form.get('netWeight').setValue(netWeight);
      }),
    ).subscribe();
  }

  save() {
    this.dialogRef.close(this.form.value);
  }
}
