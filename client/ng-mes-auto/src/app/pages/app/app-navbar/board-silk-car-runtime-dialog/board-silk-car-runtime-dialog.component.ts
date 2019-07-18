import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {ApiService} from '../../../../services/api.service';

@Component({
  templateUrl: './board-silk-car-runtime-dialog.component.html',
  styleUrls: ['./board-silk-car-runtime-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardSilkCarRuntimeDialogComponent {
  readonly form = this.fb.group({
    workshopId: [null, Validators.required],
  });
  readonly workshops$ = this.api.listWorkshop();

  constructor(private fb: FormBuilder,
              private api: ApiService) {
  }

  static open(dialog: MatDialog) {
    return dialog.open(BoardSilkCarRuntimeDialogComponent, {width: '500px'});
  }

}
