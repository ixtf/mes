import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

export class ConfirmOption {
  constructor(public content = 'Common.deleteConfirm', public title?) {
  }
}

@Component({
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {

  constructor(private store: Store,
              private dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>,
              @Inject(MAT_DIALOG_DATA) public data: ConfirmOption) {
  }

  static openUndo(dialog: MatDialog, data?: ConfirmOption): Observable<boolean> {
    data = data || new ConfirmOption('Common.undoConfirm');
    return dialog.open(ConfirmDialogComponent, {data, width: '500px'})
      .afterClosed().pipe(filter(it => it));
  }

  static openDelete(dialog: MatDialog, data?: ConfirmOption): Observable<boolean> {
    data = data || new ConfirmOption();
    return dialog.open(ConfirmDialogComponent, {data, width: '500px'})
      .afterClosed().pipe(filter(it => it));
  }

}
