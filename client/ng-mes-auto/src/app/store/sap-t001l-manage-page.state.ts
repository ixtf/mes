import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
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
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static sapT001ls(state: SapT001lManagePageStateModel) {
    return state.sapT001ls;
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<SapT001lManagePageStateModel>) {
    return this.api.listSapT001l().pipe(
      tap(sapT001ls => setState((state: SapT001lManagePageStateModel) => {
        state.sapT001ls = sapT001ls;
        return state;
      }))
    );
  }

}
