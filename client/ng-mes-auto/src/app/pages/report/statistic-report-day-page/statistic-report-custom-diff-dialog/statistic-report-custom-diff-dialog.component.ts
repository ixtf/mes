import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {Batch} from '../../../../models/batch';
import {Grade} from '../../../../models/grade';
import {Line} from '../../../../models/line';
import {PackageBox} from '../../../../models/package-box';
import {Item as StatisticReportDayItem, StatisticReportDay} from '../../../../models/statistic-report-day';
import {COMPARE_WITH_ID} from '../../../../services/util.service';

class DiffDataItem {
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
  templateUrl: './statistic-report-custom-diff-dialog.component.html',
  styleUrls: ['./statistic-report-custom-diff-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticReportCustomDiffDialogComponent {
  readonly compareWithId = COMPARE_WITH_ID;
  readonly title: string;
  readonly report: StatisticReportDay;
  readonly diffDataItems: DiffDataItem[];
  readonly allLines: Line[];
  readonly form: FormGroup;

  constructor(private store: Store,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private dialogRef: MatDialogRef<StatisticReportCustomDiffDialogComponent, StatisticReportDayItem[]>,
              @Inject(MAT_DIALOG_DATA) data: { report: StatisticReportDay; lines: Line[] }) {
    this.report = data.report;
    this.allLines = data.lines;
    this.diffDataItems = this.caclDiffDataItems(this.report);
    const totalFa = this.diffDataItems.map(diffDataItem => diffDataItem.formGroup);
    this.form = this.fb.group({totalFa: this.fb.array(totalFa)});
  }

  static open(dialog: MatDialog, data: { report: StatisticReportDay; lines: Line[] }): Observable<StatisticReportDayItem[]> {
    return dialog.open(StatisticReportCustomDiffDialogComponent, {data, disableClose: true, width: '800px'})
      .afterClosed().pipe(filter(it => it));
  }

  save() {
    console.log(this.form.value);
  }

  lines(diffDataItem: DiffDataItem, itemFaIndex: number) {
    let lines = this.allLines;
    (diffDataItem.fa.value || []).forEach((subFormValue, i) => {
      const diffedLineId = subFormValue.line && subFormValue.line.id;
      if (diffedLineId && (itemFaIndex !== i)) {
        lines = lines.filter(it => it.id !== diffedLineId);
      }
    });
    return lines;
  }

  private caclDiffDataItems(report: StatisticReportDay): DiffDataItem[] {
    const diffDataItemMap: { [key: string]: DiffDataItem } = {};
    report.unDiffPackageBoxes.forEach(packageBox => {
      const {batch, grade} = packageBox;
      const bigSilkCar = packageBox.type === 'BIG_SILK_CAR';
      const key = batch.id + grade.id + bigSilkCar;
      let diffDataItem = diffDataItemMap[key];
      if (!diffDataItem) {
        diffDataItem = new DiffDataItem(this.fb, bigSilkCar, batch, grade);
        diffDataItemMap[key] = diffDataItem;
      }
      diffDataItem.packageBoxes.push(packageBox);
    });
    return Object.values(diffDataItemMap).sort((a, b) => {
      if (a.bigSilkCar !== b.bigSilkCar) {
        return a.bigSilkCar ? 1 : 0;
      }
      let i = a.batch.batchNo.localeCompare(b.batch.batchNo);
      if (i !== 0) {
        return i;
      }
      i = b.grade.sortBy - a.grade.sortBy;
      return i;
    });
  }

}
