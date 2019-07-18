import {ChangeDetectionStrategy, Component, NgModule, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {SapT001l} from '../../../models/sapT001l';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {InitAction, SapT001lManagePageState} from '../../../store/sap-t001l-manage-page.state';

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
  displayedColumns$: Observable<string[]>;

  constructor(private store: Store) {
    this.store.dispatch(new InitAction());
  }

  ngOnInit(): void {
    this.displayedColumns$ = this.isAdmin$.pipe(
      map(it => it ? [...COLUMNS].concat(['btns']) : COLUMNS),
    );
  }

  create() {
    this.update(new SapT001l());
  }

  update(row: SapT001l) {

  }
}

@NgModule({
  declarations: [
    SapT001lManagePageComponent,
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
