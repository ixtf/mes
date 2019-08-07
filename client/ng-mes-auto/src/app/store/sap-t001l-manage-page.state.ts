import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {SapT001l} from '../models/sapT001l';
import {ApiService} from '../services/api.service';
import {CheckQ} from '../services/util.service';

const PAGE_NAME = 'SapT001lManagePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class SetQAction {
  static readonly type = `[${PAGE_NAME}] SetQAction`;

  constructor(public q: string) {
  }
}

export class SaveAction {
  static readonly type = `[${PAGE_NAME}] SaveAction`;

  constructor(public payload: SapT001l) {
  }
}

interface SapT001lManagePageStateModel {
  q?: string;
  sapT001lEntities?: { [id: string]: SapT001l };
}

@State<SapT001lManagePageStateModel>({
  name: PAGE_NAME,
  defaults: {
    sapT001lEntities: {},
  }
})
export class SapT001lManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static sapT001ls(state: SapT001lManagePageStateModel) {
    return Object.values(state.sapT001lEntities).filter(it => {
      return CheckQ(it.lgort, state.q) || CheckQ(it.lgobe, state.q);
    });
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<SapT001lManagePageStateModel>) {
    return this.api.listSapT001l().pipe(
      tap(sapT001ls => setState((state: SapT001lManagePageStateModel) => {
        const sapT001lEntities = SapT001l.toEntities(sapT001ls);
        return {sapT001lEntities};
      }))
    );
  }

  @Action(SetQAction)
  @ImmutableContext()
  SetQAction({setState}: StateContext<SapT001lManagePageStateModel>, {q}: SetQAction) {
    setState((state: SapT001lManagePageStateModel) => {
      state.q = q;
      return state;
    });
  }

  @Action(SaveAction)
  @ImmutableContext()
  SaveAction({setState}: StateContext<SapT001lManagePageStateModel>, {payload}: SaveAction) {
    return this.api.saveSapT001l(payload).pipe(
      tap(sapT001l => setState((state: SapT001lManagePageStateModel) => {
        state.sapT001lEntities[sapT001l.id] = SapT001l.assign(sapT001l);
        return state;
      })),
    );
  }

}
