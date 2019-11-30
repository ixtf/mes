import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatDialog} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {LineInputComponentModule} from '../../../components/line-input/line-input.component';
import {Line} from '../../../models/line';
import {LineMachine} from '../../../models/line-machine';
import {UtilService, VALIDATORS} from '../../../services/util.service';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../app/app.state';
import {InitAction, LineMachineManagePageState, QueryAction, SaveAction} from './line-machine-manage-page.state';
import {LineMachineUpdateDialogComponent} from './line-machine-update-dialog/line-machine-update-dialog.component';

const COLUMNS = ['line', 'item', 'spindleNum'];

@Component({
  templateUrl: './line-machine-manage-page.component.html',
  styleUrls: ['./line-machine-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineMachineManagePageComponent {
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(LineMachineManagePageState.line)
  readonly line$: Observable<Line>;
  @Select(LineMachineManagePageState.lineMachines)
  readonly lineMachines$: Observable<LineMachine[]>;
  readonly lineCtrl = new FormControl(null, [Validators.required, VALIDATORS.isEntity]);
  readonly displayedColumns$: Observable<string[]>;

  constructor(private store: Store,
              private dialog: MatDialog,
              private util: UtilService) {
    this.store.dispatch(new InitAction());
    this.displayedColumns$ = this.isAdmin$.pipe(
      map(it => it ? COLUMNS.concat(['btns']) : COLUMNS),
    );
    this.line$.subscribe(it => this.lineCtrl.patchValue(it));
  }

  @Dispatch()
  query(ev: MatAutocompleteSelectedEvent) {
    return new QueryAction({line: ev.option.value});
  }

  create() {
    const lineMachine = new LineMachine();
    lineMachine.line = this.store.selectSnapshot(LineMachineManagePageState.line);
    this.update(lineMachine);
  }

  update(lineMachine: LineMachine) {
    LineMachineUpdateDialogComponent.open(this.dialog, lineMachine).pipe(
      switchMap(it => this.store.dispatch(new SaveAction(it))),
      tap(() => this.util.showSuccess()),
    ).subscribe();
  }

}

@NgModule({
  declarations: [
    LineMachineManagePageComponent,
    LineMachineUpdateDialogComponent,
  ],
  entryComponents: [
    LineMachineUpdateDialogComponent,
  ],
  imports: [
    NgxsModule.forFeature([LineMachineManagePageState]),
    LineInputComponentModule,
    SharedModule,
    RouterModule.forChild([
      {path: '', component: LineMachineManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
