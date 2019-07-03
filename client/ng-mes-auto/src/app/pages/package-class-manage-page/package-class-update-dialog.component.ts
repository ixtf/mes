import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material';
import {Store} from '@ngxs/store';
import {PackageClass} from '../../models/package-class';

@Component({
  templateUrl: './package-class-update-dialog.component.html',
  styleUrls: ['./package-class-update-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageClassUpdateDialogComponent implements OnInit {
  readonly title: string;
  readonly form = this.fb.group({
    id: null,
    name: ['', Validators.required],
    riambCode: ['', Validators.required],
    sortBy: [0, [Validators.required, Validators.min(0)]],
  });

  constructor(private store: Store,
              private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) private packageClass: PackageClass) {
    this.title = 'Common.' + (this.packageClass.id ? 'edit' : 'new');
  }

  ngOnInit(): void {
    this.form.patchValue(this.packageClass);
  }

  update() {
  }

}
