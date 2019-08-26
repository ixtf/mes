import {ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {ApiService} from '../../../../services/api.service';
import {CODE_COMPARE, LINE_COMPARE, SEARCH_DEBOUNCE_TIME} from '../../../../services/util.service';

@Component({
  templateUrl: './board-auto-line-jikon-adapter-dialog.component.html',
  styleUrls: ['./board-auto-line-jikon-adapter-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardAutoLineJikonAdapterDialogComponent implements OnDestroy {
  readonly form = this.fb.group({
    workshopId: [null, Validators.required],
    lineIds: [null, [Validators.required, Validators.minLength(1)]],
  });
  readonly workshops$ = this.api.listWorkshop().pipe(map(it => (it || []).sort(CODE_COMPARE)));
  private readonly destroy$ = new Subject();
  readonly lines$ = this.form.get('workshopId').valueChanges.pipe(
    takeUntil(this.destroy$),
    debounceTime(SEARCH_DEBOUNCE_TIME),
    distinctUntilChanged(),
    tap(() => this.form.patchValue({lineIds: null})),
    switchMap(it => this.api.getWorkshop_Lines(it)),
    map(it => (it || []).sort(LINE_COMPARE)),
  );

  constructor(private fb: FormBuilder,
              private api: ApiService) {
  }

  static open(dialog: MatDialog) {
    return dialog.open(BoardAutoLineJikonAdapterDialogComponent, {width: '500px'});
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
