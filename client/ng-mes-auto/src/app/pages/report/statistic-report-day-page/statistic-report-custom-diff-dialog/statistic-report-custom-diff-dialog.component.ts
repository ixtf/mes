import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {Line} from '../../../../models/line';
import {Item as StatisticReportDayItem, StatisticReportDay} from '../../../../models/statistic-report-day';
import {COMPARE_WITH_ID} from '../../../../services/util.service';
import {DiffDataItem, StatisticReportCustomDiffDetailDialogComponent} from '../statistic-report-custom-diff-detail-dialog/statistic-report-custom-diff-detail-dialog.component';

@Component({
  templateUrl: './statistic-report-custom-diff-dialog.component.html',
  styleUrls: ['./statistic-report-custom-diff-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticReportCustomDiffDialogComponent {
  readonly compareWithId = COMPARE_WITH_ID;
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
      .afterClosed().pipe(filter(it => it && it.length > 0));
  }

  detail(diffDataItem: DiffDataItem) {
    StatisticReportCustomDiffDetailDialogComponent.open(this.dialog, diffDataItem);
  }

  save() {
    const items = this.form.value.totalFa.reduce((acc, cur) => acc.concat(cur.itemFa), []);
    this.dialogRef.close(items);
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
