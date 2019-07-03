import {ChangeDetectionStrategy, Component, NgModule, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Workshop} from '../../models/workshop';
import {SharedModule} from '../../shared.module';
import {AppState} from '../../store/app.state';
import {InitAction, WorkshopManagePageState} from '../../store/workshop-manage-page.state';

const COLUMNS = ['corporation', 'name', 'code', 'sapT001ls', 'sapT001lsForeign', 'sapT001lsPallet'];

@Component({
  templateUrl: './workshop-manage-page.component.html',
  styleUrls: ['./workshop-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkshopManagePageComponent implements OnInit {
  @Select(AppState.isAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(WorkshopManagePageState.workshops)
  readonly workshops$: Observable<Workshop[]>;
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
    WorkshopManagePageComponent,
  ],
  imports: [
    NgxsModule.forFeature([WorkshopManagePageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: WorkshopManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
