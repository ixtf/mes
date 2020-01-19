import {ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {Subject} from 'rxjs';
import {ApiService} from '../../../../services/api.service';

@Component({
  templateUrl: './board-to-dty-dialog.component.html',
  styleUrls: ['./board-to-dty-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardToDtyDialogComponent implements OnDestroy {
  readonly form = this.fb.group({
    destinationId: [null, Validators.required],
  });
  readonly destinations$ = this.api.listSilkCarRecordDestination();
  private readonly destroy$ = new Subject();

  constructor(private fb: FormBuilder,
              private api: ApiService) {
  }

  static open(dialog: MatDialog) {
    return dialog.open(BoardToDtyDialogComponent, {width: '500px'});
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
