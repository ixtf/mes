import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {Subject} from 'rxjs';

declare const EventBus: any;

@Component({
  templateUrl: './board-auto-line-dialog.component.html',
  styleUrls: ['./board-auto-line-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardAutoLineDialogComponent {
  readonly form = this.fb.group({
    if_riamb_id: [null, [Validators.required]],
    displayCount: [2, [Validators.required, Validators.min(1)]],
  });
  private readonly destroy$ = new Subject();

  constructor(private fb: FormBuilder) {
  }

  static open(dialog: MatDialog) {
    return dialog.open(BoardAutoLineDialogComponent, {width: '500px'});
  }
}
