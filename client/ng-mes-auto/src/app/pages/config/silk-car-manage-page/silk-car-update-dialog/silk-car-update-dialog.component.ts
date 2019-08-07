import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {Store} from '@ngxs/store';
import {combineLatest, Observable} from 'rxjs';
import {distinctUntilChanged, filter, map, tap} from 'rxjs/operators';
import {SilkCar} from '../../../../models/silk-car';
import {ApiService} from '../../../../services/api.service';

@Component({
  templateUrl: './silk-car-update-dialog.component.html',
  styleUrls: ['./silk-car-update-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkCarUpdateDialogComponent implements OnInit {
  readonly title: string;
  readonly corporation$ = this.api.listCorporation().pipe(map(it => it[0]));
  readonly form = this.fb.group({
    id: null,
    type: ['DEFAULT', Validators.required],
    number: [null, Validators.required],
    code: [null, Validators.required],
    pliesNum: [1, [Validators.required, Validators.min(1), Validators.max(2)]],
    row: [3, [Validators.required, Validators.min(3), Validators.max(4)]],
    col: [4, [Validators.required, Validators.min(4), Validators.max(6)]],
  });

  constructor(private store: Store,
              private fb: FormBuilder,
              private api: ApiService,
              private dialogRef: MatDialogRef<SilkCarUpdateDialogComponent, SilkCar>,
              @Inject(MAT_DIALOG_DATA) private silkCar: SilkCar) {
    this.title = 'Common.' + (this.silkCar.id ? 'edit' : 'new');
  }

  static open(dialog: MatDialog, data: SilkCar): Observable<SilkCar> {
    return dialog.open(SilkCarUpdateDialogComponent, {data, disableClose: true, width: '500px'})
      .afterClosed().pipe(filter(it => it));
  }

  ngOnInit(): void {
    this.form.patchValue(this.silkCar);
    const upperCaseNumber$ = this.form.get('number').valueChanges.pipe(
      filter(it => it),
      map(it => it.toUpperCase().trim()),
      filter(it => it),
      distinctUntilChanged(),
      tap(it => this.form.get('number').patchValue(it)),
    );
    combineLatest([upperCaseNumber$, this.corporation$]).pipe(
      tap(([upperCaseNumber, corporation]) => {
        this.form.get('code').patchValue(`${corporation.code}${upperCaseNumber}`);
      })
    ).subscribe();
    this.form.get('code').valueChanges.pipe(
      filter(it => it),
      map(it => it.toUpperCase().trim()),
      filter(it => it),
      distinctUntilChanged(),
      tap(it => this.form.get('code').patchValue(it)),
    ).subscribe();
  }

  save() {
    console.log(this.form.value);
  }

}
