import {ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap, takeUntil, tap} from 'rxjs/operators';
import {ApiService} from '../../../../services/api.service';
import {SEARCH_DEBOUNCE_TIME} from '../../../../services/util.service';

@Component({
  templateUrl: './board-abnormal-dialog.component.html',
  styleUrls: ['./board-abnormal-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardAbnormalDialogComponent implements OnDestroy {
  readonly form = this.fb.group({
    workshopId: [null, Validators.required],
    lineIds: [null, [Validators.required, Validators.minLength(1)]]
  });
  readonly workshops$ = this.api.listWorkshop();
  private readonly destroy$ = new Subject();
  readonly lines$ = this.form.get('workshopId').valueChanges.pipe(
    takeUntil(this.destroy$),
    debounceTime(SEARCH_DEBOUNCE_TIME),
    distinctUntilChanged(),
    tap(() => this.form.patchValue({lineIds: null})),
    switchMap(it => this.api.getWorkshop_Lines(it))
  );

  constructor(private fb: FormBuilder,
              private api: ApiService) {
  }

  static open(dialog: MatDialog) {
    return dialog.open(BoardAbnormalDialogComponent, {width: '500px'});
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
