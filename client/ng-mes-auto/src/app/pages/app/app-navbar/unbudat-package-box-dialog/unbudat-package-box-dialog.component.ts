import {ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import * as moment from 'moment';
import {Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {ApiService} from '../../../../services/api.service';
import {CODE_COMPARE} from '../../../../services/util.service';

@Component({
  templateUrl: './unbudat-package-box-dialog.component.html',
  styleUrls: ['./unbudat-package-box-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnbudatPackageBoxDialogComponent implements OnDestroy {
  readonly form = this.fb.group({
    workshopId: [null, Validators.required],
    date: [moment(), [Validators.required, Validators.minLength(1)]],
    budat: [moment(), [Validators.required, Validators.minLength(1)]],
    budatClassId: [null, Validators.required],
  });
  readonly workshops$ = this.api.listWorkshop().pipe(map(it => (it || []).sort(CODE_COMPARE)));
  readonly budatClasses$ = this.api.listPackageClass();
  readonly maxDate = moment();
  readonly minDate = moment();
  private readonly destroy$ = new Subject();

  constructor(private fb: FormBuilder,
              private api: ApiService) {
  }

  static open(dialog: MatDialog) {
    return dialog.open(UnbudatPackageBoxDialogComponent, {width: '500px'});
  }

  queryParams(): void {
    const result = this.form.value;
    result.date = moment(result.date).format('YYYY-MM-DD');
    result.budat = moment(result.budat).format('YYYY-MM-DD');
    return result;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
