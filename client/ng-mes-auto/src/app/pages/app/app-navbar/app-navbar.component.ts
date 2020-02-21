import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {Select} from '@ngxs/store';
import {Observable} from 'rxjs';
import {AuthInfo} from '../../../models/auth-info';
import {AppState, LogoutAction} from '../app.state';
import {BoardAbnormalDialogComponent} from './board-abnormal-dialog/board-abnormal-dialog.component';
import {BoardAutoLineDialogComponent} from './board-auto-line-dialog/board-auto-line-dialog.component';
import {BoardAutoLineJikonAdapterDialogComponent} from './board-auto-line-jikon-adapter-dialog/board-auto-line-jikon-adapter-dialog.component';
import {BoardSilkCarRuntimeDialogComponent} from './board-silk-car-runtime-dialog/board-silk-car-runtime-dialog.component';
import {BoardToDtyDialogComponent} from './board-to-dty-dialog/board-to-dty-dialog.component';
import {UnbudatPackageBoxDialogComponent} from './unbudat-package-box-dialog/unbudat-package-box-dialog.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './app-navbar.component.html',
  styleUrls: ['./app-navbar.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppNavbarComponent {
  @Select(AppState.isLoading)
  readonly isLoading$: Observable<boolean>;
  @Select(AppState.authInfo)
  readonly authInfo$: Observable<AuthInfo>;
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;

  constructor(private dialog: MatDialog) {
  }

  @Dispatch()
  logout() {
    return new LogoutAction();
  }

  boardAutoLineJikonAdapter() {
    BoardAutoLineJikonAdapterDialogComponent.open(this.dialog);
  }

  boardAutoLine() {
    BoardAutoLineDialogComponent.open(this.dialog);
  }

  boardAbnormal() {
    BoardAbnormalDialogComponent.open(this.dialog);
  }

  boardSilkCarRuntime() {
    BoardSilkCarRuntimeDialogComponent.open(this.dialog);
  }

  unbudatPackageBoxes() {
    UnbudatPackageBoxDialogComponent.open(this.dialog);
  }

  boardToDty() {
    BoardToDtyDialogComponent.open(this.dialog);
  }
}
