import {HttpResponse} from '@angular/common/http';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {saveAs} from 'file-saver';
import {filter, switchMap, tap} from 'rxjs/operators';
import {ConfirmDialogComponent} from '../../../../components/confirm-dialog/confirm-dialog.component';
import {ApiService} from '../../../../services/api.service';
import {UtilService} from '../../../../services/util.service';

@Component({
  templateUrl: './statistic-report-combine-dialog.component.html',
  styleUrls: ['./statistic-report-combine-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticReportCombineDialogComponent {
  files: File[] = [];

  constructor(private api: ApiService,
              private util: UtilService,
              private dialog: MatDialog,
              private dialogRef: MatDialogRef<StatisticReportCombineDialogComponent>,
              private changeDetectorRef: ChangeDetectorRef) {
    this.dialogRef.afterClosed().pipe(
      filter(it => it && it.length > 0),
      switchMap(it => this.api.statisticReportCombine(it)),
      tap(res => saveAs(res.body, 'combines.xlsx')),
    ).subscribe();
  }

  static open(dialog: MatDialog) {
    dialog.open(StatisticReportCombineDialogComponent, {disableClose: true, width: '500px', minHeight: '400px'});
  }

  handleFileInput(fileList: FileList) {
    this.files = Array.from(fileList).sort((a, b) => a.name.localeCompare(b.name));
  }

  delete(file: File) {
    ConfirmDialogComponent.openDelete(this.dialog).pipe(
      tap(() => {
        this.files = this.files.filter(it => it !== file);
        this.changeDetectorRef.detectChanges();
      })
    ).subscribe();
  }
}

export const getFileNameFromResponseContentDisposition = (res: HttpResponse<any>) => {
  const contentDisposition = res.headers.get('content-disposition') || '';
  console.log(contentDisposition);
  const matches = /filename=([^;]+)/ig.exec(contentDisposition);
  const fileName = (matches[1] || 'untitled').trim();
  return fileName;
};
