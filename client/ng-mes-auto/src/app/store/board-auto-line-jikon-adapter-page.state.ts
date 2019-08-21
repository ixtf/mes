import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {GetSilkSpindleInfoDTO} from '../models/get-silk-spindle-info-dto';
import {SilkCarRuntime} from '../models/silk-car-runtime';
import {ApiShareService} from '../services/api.service';

const PAGE_NAME = 'BoardAutoLineJikonAdapterPage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;

  constructor(public payload: { lineId: string; displayCount: string }) {
  }
}

export class ReceivedMessageAction {
  static readonly type = `[${PAGE_NAME}] ReceivedMessageAction`;

  constructor(public payload: MessageModel) {
  }
}

export class MessageModel {
  principalName: string;
  silkCarRuntime: SilkCarRuntime;
  dto: GetSilkSpindleInfoDTO;
  reasons?: string[];
}

interface StateModel {
  if_riamb_id?: string;
  displayCount?: number;
  messages?: MessageModel[];
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {}
})
export class BoardAutoLineJikonAdapterPageState {
  constructor(private api: ApiShareService) {
  }

  @Selector()
  @ImmutableSelector()
  static messages(state: StateModel): MessageModel[] {
    return state.messages;
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<StateModel>, {payload}: InitAction) {
    setState((state: StateModel) => {
      state.if_riamb_id = payload.if_riamb_id;
      state.displayCount = parseInt((payload.displayCount || '1'), 10);
      return state;
    });
  }

  @Action(ReceivedMessageAction)
  @ImmutableContext()
  ReceivedMessageAction({setState, getState}: StateContext<StateModel>, {payload}: ReceivedMessageAction) {
    const {if_riamb_id} = getState();
    if (if_riamb_id !== payload.principalName) {
      return;
    }
    setState((state: StateModel) => {
      state.messages = state.messages || [];
      state.displayCount = state.displayCount || 1;
      state.displayCount = state.displayCount < 1 ? 1 : state.displayCount;
      state.messages = [payload].concat(state.messages.slice(0, state.displayCount));
      return state;
    });
  }

}
