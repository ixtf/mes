import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatDialog} from '@angular/material';
import {Emittable, Emitter} from '@ngxs-labs/emitter';
import {Select} from '@ngxs/store';
import {Observable} from 'rxjs';
import {AuthInfo} from '../../../models/auth-info';
import {ApiService} from '../../../services/api.service';
import {AppState} from '../../../store/app.state';
import {BoardAbnormalDialogComponent} from './board-abnormal-dialog/board-abnormal-dialog.component';
import {BoardAutoLineDialogComponent} from './board-auto-line-dialog/board-auto-line-dialog.component';
import {BoardSilkCarRuntimeDialogComponent} from './board-silk-car-runtime-dialog/board-silk-car-runtime-dialog.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './app-navbar.component.html',
  styleUrls: ['./app-navbar.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppNavbarComponent {
  @Select(AppState.isLoading)
  readonly isLoading$: Observable<boolean>;
  @Select(AppState.authInfo)
  readonly authInfo$: Observable<AuthInfo>;
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Emitter(AppState.LogoutAction)
  readonly logout$: Emittable;

  constructor(private dialog: MatDialog,
              private api: ApiService) {
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
}
