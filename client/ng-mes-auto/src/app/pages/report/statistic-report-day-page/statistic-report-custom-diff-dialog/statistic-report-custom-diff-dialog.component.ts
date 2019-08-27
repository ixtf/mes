import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {Store} from '@ngxs/store';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {Batch} from '../../../../models/batch';
import {Grade} from '../../../../models/grade';
import {PackageBox} from '../../../../models/package-box';
import {Item as StatisticReportDayItem, StatisticReportDay} from '../../../../models/statistic-report-day';

class DiffDataItem {
  formGroup: FormGroup;

  constructor(public batch: Batch,
              public grade: Grade,
              public packageBoxes: PackageBox[] = []) {
    // this.formArray = new FormArray([new FormControl()], [Validators.required, Validators.minLength(1), this.checkValidator]);
  }

  get silkCount(): number {
    return (this.packageBoxes || []).reduce((acc, cur) => acc + cur.silkCount, 0);
  }

  get silkWeight(): number {
    return (this.packageBoxes || []).reduce((acc, cur) => acc + cur.netWeight, 0);
  }

  private checkValidator(control: AbstractControl) {
    const value = control.value;
    if (!value) {
      return null;
    }
    const silkCount = (value || []).reduce((acc, cur) => acc + cur.silkCount, 0);
    const silkWeight = (value || []).reduce((acc, cur) => acc + cur.silkWeight, 0);
    if (silkCount === this.silkCount && silkWeight === this.silkWeight) {
      return null;
    }
    return {checkValidator: true};
  }
}

@Component({
  templateUrl: './statistic-report-custom-diff-dialog.component.html',
  styleUrls: ['./statistic-report-custom-diff-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticReportCustomDiffDialogComponent {
  readonly title: string;
  readonly diffDataItems$: Observable<DiffDataItem[]>;
  readonly customDiffItems$: Observable<StatisticReportDayItem[]>;
  readonly form: FormGroup;
  private readonly subject$: BehaviorSubject<{ report: StatisticReportDay; diffDataItems: DiffDataItem[] }>;

  constructor(private store: Store,
              private fb: FormBuilder,
              private dialogRef: MatDialogRef<StatisticReportCustomDiffDialogComponent, StatisticReportDayItem[]>,
              @Inject(MAT_DIALOG_DATA) report: StatisticReportDay) {
    const diffDataItems = this.diffDataItems(report);
    const ar = diffDataItems.map(diffDataItem => diffDataItem.formGroup);
    this.form = this.fb.group({ar: this.fb.array(ar)});
    this.subject$ = new BehaviorSubject({report, diffDataItems});
    this.diffDataItems$ = this.subject$.pipe(map(it => it.diffDataItems));
  }

  static open(dialog: MatDialog, data: StatisticReportDay): Observable<StatisticReportDayItem[]> {
    return dialog.open(StatisticReportCustomDiffDialogComponent, {data, disableClose: true, width: '800px'})
      .afterClosed().pipe(filter(it => it));
  }

  save() {
  }

  private diffDataItems(report: StatisticReportDay): DiffDataItem[] {
    const diffDataItemMap: { [key: string]: DiffDataItem } = {};
    report.unDiffPackageBoxes.forEach(packageBox => {
      const {batch, grade} = packageBox;
      const key = batch.id + grade.id;
      let diffDataItem = diffDataItemMap[key];
      if (!diffDataItem) {
        diffDataItem = new DiffDataItem(batch, grade);
        const formGroup = this.fb.group({});
        diffDataItem.formGroup = formGroup;
        diffDataItemMap[key] = diffDataItem;
      }
      diffDataItem.packageBoxes.push(packageBox);
    });
    return Object.values(diffDataItemMap).sort((a, b) => {
      let i = a.batch.batchNo.localeCompare(b.batch.batchNo);
      if (i !== 0) {
        return i;
      }
      i = b.grade.sortBy - a.grade.sortBy;
      return i;
    });
  }

  private checkValidator(control: AbstractControl) {
    const value = control.value;
    if (!value) {
      return null;
    }
    return null;
    // return {checkValidator: true};
  }
}
