import {ChangeDetectionStrategy, Component, NgModule, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {RouterModule} from '@angular/router';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Workshop} from '../../models/workshop';
import {COPY} from '../../services/util.service';
import {SharedModule} from '../../shared.module';
import {AppState} from '../../store/app.state';
import {InitAction, WorkshopManagePageState} from '../../store/workshop-manage-page.state';
import {WorkshopUpdateDialogComponent} from './workshop-update-dialog.component';

const COLUMNS = ['corporation', 'name', 'code', 'sapT001ls', 'sapT001lsForeign', 'sapT001lsPallet'];

@Component({
  templateUrl: './workshop-manage-page.component.html',
  styleUrls: ['./workshop-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkshopManagePageComponent implements OnInit {
  // readonly copy = COPY;
  @Select(AppState.isAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(WorkshopManagePageState.workshops)
  readonly workshops$: Observable<Workshop[]>;
  displayedColumns$: Observable<string[]>;

  constructor(private store: Store,
              private dialog: MatDialog) {
    this.store.dispatch(new InitAction());
  }

  ngOnInit(): void {
    this.displayedColumns$ = this.isAdmin$.pipe(
      map(it => it ? ['id'].concat(COLUMNS).concat(['btns']) : COLUMNS),
    );
  }

  copy(s: string, ev: MouseEvent) {
    ev.stopPropagation();
    console.log(ev);
    if (ev.ctrlKey) {
      COPY(s);
    }
  }

  create() {
    this.update(null);
  }

  update(workshop: Workshop) {
    if (!workshop) {
      workshop = new Workshop();
      workshop.corporation = this.store.selectSnapshot(AppState.corporation);
    }
    this.dialog.open(WorkshopUpdateDialogComponent, {data: workshop, disableClose: true, width: '500px'});
  }
}

@NgModule({
  declarations: [
    WorkshopManagePageComponent,
    WorkshopUpdateDialogComponent,
  ],
  entryComponents: [
    WorkshopUpdateDialogComponent
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
