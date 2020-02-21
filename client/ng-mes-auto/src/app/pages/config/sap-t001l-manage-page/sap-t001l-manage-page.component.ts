import {ChangeDetectionStrategy, Component, NgModule, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {SapT001l} from '../../../models/sapT001l';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../app/app.state';
import {InitAction, SapT001lManagePageState, SaveAction, SetQAction} from './sap-t001l-manage-page.state';
import {SapT001lUpdateDialogComponent} from './sap-t001l-update-dialog/sap-t001l-update-dialog.component';

const COLUMNS = ['lgort', 'lgobe'];

@Component({
  templateUrl: './sap-t001l-manage-page.component.html',
  styleUrls: ['./sap-t001l-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SapT001lManagePageComponent implements OnInit {
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(SapT001lManagePageState.sapT001ls)
  readonly sapT001ls$: Observable<SapT001l[]>;
  readonly qCtrl = new FormControl();
  readonly displayedColumns$ = this.isAdmin$.pipe(
    map(it => it ? COLUMNS.concat(['btns']) : COLUMNS),
  );

  constructor(private store: Store,
              private dialog: MatDialog) {
    this.store.dispatch(new InitAction());
  }

  ngOnInit(): void {
    // this.qCtrl.valueChanges.subscribe(it => this.store.dispatch(new SetQAction(it)));
  }

  @Dispatch()
  setQ(q: string) {
    return new SetQAction(q);
  }

  create() {
    this.update(new SapT001l());
  }

  @Dispatch()
  update(sapT001l: SapT001l) {
    return SapT001lUpdateDialogComponent.open(this.dialog, sapT001l).pipe(
      map(it => new SaveAction(it))
    );
  }

}

@NgModule({
  declarations: [
    SapT001lManagePageComponent,
    SapT001lUpdateDialogComponent,
  ],
  entryComponents: [
    SapT001lUpdateDialogComponent,
  ],
  imports: [
    NgxsModule.forFeature([SapT001lManagePageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: SapT001lManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
