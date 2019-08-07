import {ChangeDetectionStrategy, Component, NgModule, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {SilkCarRecordDestination} from '../../../models/silk-car-record-destination';
import {SharedModule} from '../../../shared.module';
import {AppState} from '../../../store/app.state';
import {InitAction, SaveAction, SilkCarRecordDestinationManagePageState} from '../../../store/silk-car-record-destination-manage-page.state';
import {SilkCarRecordDestinationUpdateDialogComponent} from './silk-car-record-destination-update-dialog/silk-car-record-destination-update-dialog.component';

@Component({
  templateUrl: './silk-car-record-destination-manage-page.component.html',
  styleUrls: ['./silk-car-record-destination-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkCarRecordDestinationManagePageComponent implements OnInit {
  readonly displayedColumns = ['name', 'btns'];
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Select(SilkCarRecordDestinationManagePageState.silkCarRecordDestinations)
  readonly silkCarRecordDestinations$: Observable<SilkCarRecordDestination[]>;

  constructor(private store: Store,
              private dialog: MatDialog) {
    this.store.dispatch(new InitAction());
  }

  ngOnInit(): void {
  }

  create() {
    this.update(new SilkCarRecordDestination());
  }

  @Dispatch()
  update(silkCarRecordDestination: SilkCarRecordDestination) {
    return SilkCarRecordDestinationUpdateDialogComponent.open(this.dialog, silkCarRecordDestination).pipe(
      map(it => new SaveAction(it))
    );
  }

}

@NgModule({
  declarations: [
    SilkCarRecordDestinationManagePageComponent,
    SilkCarRecordDestinationUpdateDialogComponent,
  ],
  entryComponents: [
    SilkCarRecordDestinationUpdateDialogComponent
  ],
  imports: [
    NgxsModule.forFeature([SilkCarRecordDestinationManagePageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: SilkCarRecordDestinationManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
