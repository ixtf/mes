import {ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {SapT001l} from '../models/sapT001l';
import {ApiService} from '../services/api.service';

export class InitAction {
  static readonly type = '[SapT001lManagePage] InitAction';
}

interface SapT001lManagePageStateModel {
  q?: string;
  sapT001ls?: SapT001l[];
}

@State<SapT001lManagePageStateModel>({
  name: 'SapT001lManagePage',
  defaults: {}
})
export class SapT001lManagePageState {
  constructor(private apiService: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static sapT001ls(state: SapT001lManagePageStateModel) {
    return state.sapT001ls;
  }

  @Action(InitAction)
  InitAction({patchState}: StateContext<SapT001lManagePageStateModel>) {
    return this.apiService.listSapT001l().pipe(
      tap(sapT001ls => patchState({sapT001ls}))
    );
  }

}
