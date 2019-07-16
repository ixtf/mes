import {ChangeDetectionStrategy, Component, NgModule, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PackageClass} from '../../../models/package-class';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {InitAction, PackageClassManagePageState} from '../../../store/package-class-manage-page.state';
import {PackageClassUpdateDialogComponent} from './package-class-update-dialog/package-class-update-dialog.component';

const COLUMNS = ['name', 'riambCode', 'sortBy'];

@Component({
  templateUrl: './package-class-manage-page.component.html',
  styleUrls: ['./package-class-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageClassManagePageComponent implements OnInit {
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(PackageClassManagePageState.packageClasses)
  readonly packageClasses$: Observable<PackageClass[]>;
  displayedColumns$: Observable<string[]>;

  constructor(private store: Store) {
    this.store.dispatch(new InitAction());
  }

  ngOnInit(): void {
    this.displayedColumns$ = this.isAdmin$.pipe(
      map(it => it ? ['id'].concat(COLUMNS).concat(['btns']) : COLUMNS)
    );
  }

  create() {
    this.update(null);
  }

  update(id: string) {
  }
}

@NgModule({
  declarations: [
    PackageClassManagePageComponent,
    PackageClassUpdateDialogComponent,
  ],
  entryComponents: [
    PackageClassUpdateDialogComponent
  ],
  imports: [
    NgxsModule.forFeature([PackageClassManagePageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: PackageClassManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
