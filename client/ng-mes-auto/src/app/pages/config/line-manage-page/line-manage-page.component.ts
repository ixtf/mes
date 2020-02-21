import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MatSelectChange} from '@angular/material/select';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {DoffingConfigDialogComponent, DoffingConfigDialogComponentModule} from '../../../components/doffing-config-dialog/doffing-config-dialog.component';
import {Line} from '../../../models/line';
import {Workshop} from '../../../models/workshop';
import {UtilService} from '../../../services/util.service';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../app/app.state';
import {InitAction, LineManagePageState, QueryAction, SaveAction} from './line-manage-page.state';
import {LineUpdateDialogComponent} from './line-update-dialog/line-update-dialog.component';

const COLUMNS = ['workshop', 'name', 'doffingType'];

@Component({
  templateUrl: './line-manage-page.component.html',
  styleUrls: ['./line-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineManagePageComponent {
  readonly displayedColumns$: Observable<string[]>;
  readonly workshopIdCtrl = new FormControl();
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(LineManagePageState.workshopId)
  readonly workshopId$: Observable<string>;
  @Select(LineManagePageState.workshops)
  readonly workshops$: Observable<Workshop[]>;
  @Select(LineManagePageState.lines)
  readonly lines$: Observable<Line[]>;

  constructor(private store: Store,
              private util: UtilService,
              private dialog: MatDialog) {
    this.store.dispatch(new InitAction());
    this.displayedColumns$ = this.isAdmin$.pipe(
      map(it => it ? [...COLUMNS].concat(['btns']) : COLUMNS),
    );
    this.workshopId$.subscribe(it => this.workshopIdCtrl.patchValue(it));
  }

  create() {
    const line = new Line();
    line.workshop = this.store.selectSnapshot(LineManagePageState.workshop);
    this.update(line);
  }

  update(line: Line) {
    LineUpdateDialogComponent.open(this.dialog, line).pipe(
      switchMap(it => this.store.dispatch(new SaveAction(it))),
      tap(() => this.util.showSuccess()),
    ).subscribe();
  }

  @Dispatch()
  query(ev: MatSelectChange) {
    return new QueryAction({workshopId: ev.source.value});
  }

  doffingConfig(line: Line) {
    DoffingConfigDialogComponent.open(this.dialog, {spindleNum: 5}).pipe(
      switchMap(it => this.store.dispatch(new SaveAction(it))),
      tap(() => this.util.showSuccess()),
    ).subscribe();
  }
}

@NgModule({
  declarations: [
    LineManagePageComponent,
    LineUpdateDialogComponent,
  ],
  entryComponents: [
    LineUpdateDialogComponent,
  ],
  imports: [
    DoffingConfigDialogComponentModule,
    NgxsModule.forFeature([LineManagePageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: LineManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
