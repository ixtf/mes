import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {SilkCarRuntime} from '../models/silk-car-runtime';
import {ApiService} from '../services/api.service';

export class InitAction {
  static readonly type = '[BoardAutoLinePage] InitAction';

  constructor(public payload: { if_riamb_id: string; displayCount: string }) {
  }
}

export class ReceivedMessageAction {
  static readonly type = '[BoardAutoLinePage] ReceivedMessageAction';

  constructor(public payload: MessageModel) {
  }
}

interface BoardAutoLinePageStateModel {
  if_riamb_id?: string;
  displayCount?: number;
  messages?: MessageModel[];
}

export class MessageModel {
  silkCarRuntime: SilkCarRuntime;
  reasons?: string[];
}

@State<BoardAutoLinePageStateModel>({
  name: 'BoardAutoLinePage',
  defaults: {}
})
export class BoardAutoLinePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static messages(state: BoardAutoLinePageStateModel): MessageModel[] {
    return state.messages;
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<BoardAutoLinePageStateModel>, {payload}: InitAction) {
    setState((state: BoardAutoLinePageStateModel) => {
      state.if_riamb_id = payload.if_riamb_id;
      state.displayCount = parseInt((payload.displayCount || '1'), 10);
      return state;
    });
  }

  @Action(ReceivedMessageAction)
  @ImmutableContext()
  ReceivedMessageAction({setState}: StateContext<BoardAutoLinePageStateModel>, {payload}: ReceivedMessageAction) {
    setState((state: BoardAutoLinePageStateModel) => {
      state.messages = state.messages || [];
      state.displayCount = state.displayCount || 1;
      state.displayCount = state.displayCount < 1 ? 1 : state.displayCount;
      state.messages = [payload].concat(state.messages.slice(0, state.displayCount));
      return state;
    });
  }

}
