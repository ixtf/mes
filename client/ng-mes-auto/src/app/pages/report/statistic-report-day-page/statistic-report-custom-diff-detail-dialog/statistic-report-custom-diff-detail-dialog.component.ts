import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {PackageBoxDetailDialogPageComponent} from '../../../../components/package-box-detail-dialog-page/package-box-detail-dialog-page.component';
import {Batch} from '../../../../models/batch';
import {Grade} from '../../../../models/grade';
import {PackageBox} from '../../../../models/package-box';
import {ApiService} from '../../../../services/api.service';

export class DiffDataItem {
  formGroup: FormGroup;

  constructor(private fb: FormBuilder,
              public bigSilkCar: boolean,
              public batch: Batch,
              public grade: Grade,
              public packageBoxes: PackageBox[] = []) {
    this.formGroup = this.fb.group({
      itemFa: this.fb.array([], [this.itemValidator]),
    });
  }

  get silkCount(): number {
    return (this.packageBoxes || []).reduce((acc, cur) => acc + cur.silkCount, 0);
  }

  get silkWeight(): number {
    return (this.packageBoxes || []).reduce((acc, cur) => acc + cur.netWeight, 0);
  }

  get diffSilkCount(): number {
    return (this.fa.value || []).reduce((acc, cur) => acc + cur.silkCount, 0);
  }

  get diffSilkWeight(): number {
    return (this.fa.value || []).reduce((acc, cur) => acc + cur.silkWeight, 0);
  }

  get fa(): FormArray {
    return this.formGroup.get('itemFa') as FormArray;
  }

  addFa() {
    const group = this.fb.group({
      bigSilkCar: [this.bigSilkCar, Validators.required],
      batch: [this.batch, Validators.required],
      grade: [this.grade, Validators.required],
      line: [null, Validators.required],
      silkCount: [null, [Validators.required, Validators.min(1)]],
      silkWeight: [null, [Validators.required, Validators.min(1)]],
    });
    if (this.grade.sortBy >= 100) {
      group.get('silkCount').valueChanges.subscribe(it => {
        group.get('silkWeight').setValue(it * this.batch.silkWeight);
      });
    }
    this.fa.push(group);
  }

  deleteFa(itemFaIndex: number, ev: MouseEvent) {
    if (ev.ctrlKey || ev.shiftKey) {
      this.fa.removeAt(itemFaIndex);
    }
  }

  private readonly itemValidator = (control: AbstractControl) => {
    const value = control.value;
    if (value && value.length > 0) {
      const lineIds = value.map(it => it.line && it.line.id).filter(it => it);
      const lineIdSet = new Set(lineIds);
      if (lineIds.length !== lineIdSet.size) {
        return {itemValidator: true};
      }
      const silkCount = value.reduce((acc, cur) => acc + cur.silkCount, 0);
      const silkWeight = value.reduce((acc, cur) => acc + cur.silkWeight, 0);
      if (silkCount === this.silkCount && silkWeight === this.silkWeight) {
        return null;
      }
    }
    return {itemValidator: true};
  };
}

@Component({
  templateUrl: './statistic-report-custom-diff-detail-dialog.component.html',
  styleUrls: ['./statistic-report-custom-diff-detail-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticReportCustomDiffDetailDialogComponent {
  readonly displayedColumns = ['code', 'batchNo', 'grade', 'silkCount', 'netWeight', 'btns'];
  readonly diffDataItem: DiffDataItem;

  constructor(private api: ApiService,
              private dialog: MatDialog,
              private dialogRef: MatDialogRef<StatisticReportCustomDiffDetailDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: DiffDataItem) {
    this.diffDataItem = data;
  }

  static open(dialog: MatDialog, data: DiffDataItem) {
    return dialog.open(StatisticReportCustomDiffDetailDialogComponent, {data, width: '800px'});
  }

  detail(packageBox: PackageBox) {
    this.api.getPackageBox(packageBox.id).subscribe(it => {
      PackageBoxDetailDialogPageComponent.open(this.dialog, it);
    });
  }
}
