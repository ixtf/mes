import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {PackageClass} from '../../../../models/package-class';
import {AppState} from '../../../../store/app.state';

@Component({
  templateUrl: './package-class-update-dialog.component.html',
  styleUrls: ['./package-class-update-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageClassUpdateDialogComponent implements OnInit {
  readonly title: string;
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  readonly form = this.fb.group({
    id: null,
    name: [null, Validators.required],
    riambCode: [null, Validators.required],
    sortBy: [0, [Validators.required, Validators.min(0)]],
  });

  constructor(private store: Store,
              private fb: FormBuilder,
              private dialogRef: MatDialogRef<PackageClassUpdateDialogComponent, PackageClass>,
              @Inject(MAT_DIALOG_DATA) private packageClass: PackageClass) {
    this.title = 'Common.' + (this.packageClass.id ? 'edit' : 'new');
  }

  static open(dialog: MatDialog, data: PackageClass): Observable<PackageClass> {
    return dialog.open(PackageClassUpdateDialogComponent, {data, disableClose: true, width: '500px'})
      .afterClosed().pipe(filter(it => it));
  }

  ngOnInit(): void {
    this.form.patchValue(this.packageClass);
  }

  save() {
  }

}
