/* tslint:disable:no-eval */
import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {AbstractControl, FormBuilder, ValidationErrors, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {merge, Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, takeUntil, tap} from 'rxjs/operators';
import {Batch} from '../../../models/batch';
import {Grade} from '../../../models/grade';
import {PackageBox} from '../../../models/package-box';
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
  readonly workshop: Workshop;
  readonly palletTypes$ = this.api.palletTypes();
  readonly packageTypes$ = this.api.packageTypes();
  readonly foamTypes$ = this.api.foamTypes();
  readonly packageClasses$ = this.api.listPackageClass();
  readonly grades$ = this.api.listGrade().pipe(map(it => it.sort(SORT_BY_COMPARE)));
  readonly form = this.fb.group({
    id: null,
    budat: [null, Validators.required],
    budatClass: [null, Validators.required],
    batch: [null, (ctrl: AbstractControl): ValidationErrors => {
      const value: Batch = ctrl.value;
      if (!value) {
        return {required: true};
      }
      if (value.workshop.id !== this.workshop.id) {
        return {workshop: true};
      }
      return null;
    }],
    grade: [null, Validators.required],
    silkCount: [null, [Validators.required, Validators.min(1)]],
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
              private dialogRef: MatDialogRef<PackageBoxCreateDialogComponent, PackageBox>,
              @Inject(MAT_DIALOG_DATA) data: { workshop: Workshop; packageBox: PackageBox; }) {
    this.workshop = data.workshop;
    this.gradeCtrl.valueChanges.pipe(
      takeUntil(this.dialogRef.afterClosed()),
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      tap((grade: Grade) => {
        if (grade && grade.sortBy < 100) {
          this.grossWeightCtrl.enable();
        } else {
          this.grossWeightCtrl.disable();
        }
      }),
    ).subscribe();
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
    this.form.patchValue(data.packageBox);
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
    return dialog.open(PackageBoxCreateDialogComponent, {data, disableClose: true, minWidth: '800px'})
      .afterClosed().pipe(filter(it => it));
  }

  save() {
    this.dialogRef.close(this.form.value);
  }
}
