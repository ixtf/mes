import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {MatDialog} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Grade} from '../../../models/grade';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {GradeManagePageState, InitAction, SaveAction} from '../../../store/grade-manage-page.state';
import {GradeUpdateDialogComponent} from './grade-update-dialog/grade-update-dialog.component';

const COLUMNS = ['id', 'code', 'name', 'sortBy'];

@Component({
  templateUrl: './grade-manage-page.component.html',
  styleUrls: ['./grade-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GradeManagePageComponent {
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(GradeManagePageState.grades)
  readonly grades$: Observable<Grade[]>;
  readonly displayedColumns$ = this.isAdmin$.pipe(
    map(it => it ? COLUMNS.concat(['btns']) : COLUMNS)
  );

  constructor(private store: Store,
              private dialog: MatDialog) {
    this.store.dispatch(new InitAction());
  }

  @Dispatch()
  update(grade: Grade) {
    return GradeUpdateDialogComponent.open(this.dialog, grade).pipe(
      map(it => new SaveAction(it))
    );
  }
}

@NgModule({
  declarations: [
    GradeManagePageComponent,
    GradeUpdateDialogComponent,
  ],
  entryComponents: [
    GradeUpdateDialogComponent
  ],
  imports: [
    NgxsModule.forFeature([GradeManagePageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: GradeManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
