import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngxs/store';
import {NoGradeInfo, SilkCarRecordInfo} from '../silk-exception-report-page.z';

@Component({
  templateUrl: './silk-exception-report-no-grade-dialog.component.html',
  styleUrls: ['./silk-exception-report-no-grade-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkExceptionReportNoGradeDialogComponent {
  readonly displayedColumns = ['code', 'creator', 'creatorDateTime', 'btns'];
  readonly noGradeInfos: NoGradeInfo[];
  readonly silkCarRecordInfos: SilkCarRecordInfo[];

  constructor(private store: Store,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private dialogRef: MatDialogRef<SilkExceptionReportNoGradeDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: { noGradeInfos: NoGradeInfo[]; }) {
    this.noGradeInfos = data.noGradeInfos;
    this.silkCarRecordInfos = this.noGradeInfos.reduce((acc, cur) => acc.concat(cur.silkCarRecordInfos), []);
  }

  static open(dialog: MatDialog, data: { noGradeInfos: NoGradeInfo[]; }) {
    dialog.open(SilkExceptionReportNoGradeDialogComponent, {data, width: '800px'});
  }

  routerLinkCarRecord(info: SilkCarRecordInfo) {
    return info.type === 'HISTORY' ? '/silkCarRecord' : '/silkCarRuntime';
  }

  routerLinkCarRecordQueryParams(info: SilkCarRecordInfo) {
    return info.type === 'HISTORY' ? {id: info.id} : {code: info.silkCar.code};
  }
}
