import {Injectable} from '@angular/core';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {GetSilkSpindleInfoDTO} from '../../../models/get-silk-spindle-info-dto';
import {SilkCarRuntime} from '../../../models/silk-car-runtime';
import {ApiShareService} from '../../../services/api.service';

const PAGE_NAME = 'BoardAutoLineJikonAdapterPage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;

  constructor(public payload: { workshopId: string; lineIds: string | string[]; displayCount: string }) {
  }
}

export class ReceivedMessageAction {
  static readonly type = `[${PAGE_NAME}] ReceivedMessageAction`;

  constructor(public payload: MessageModel) {
  }
}

export class MessageModel {
  silkCarRuntime: SilkCarRuntime;
  dto: GetSilkSpindleInfoDTO;
  reasons?: string[];
}

interface StateModel {
  workshopId?: string;
  lineIds?: string[];
  displayCount?: number;
  messages?: MessageModel[];
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {},
})
@Injectable()
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
  InitAction({setState, dispatch}: StateContext<StateModel>, {payload: {workshopId, lineIds, displayCount}}: InitAction) {
    setState((state: StateModel) => {
      state.workshopId = workshopId;
      if (Array.isArray(lineIds)) {
        state.lineIds = lineIds as string[];
      } else if (typeof lineIds === 'string') {
        state.lineIds = [lineIds as string];
      }
      state.displayCount = parseInt((displayCount || '6'), 10);
      return state;
    });
    // return dispatch(new RefreshAction());
  }

  @Action(ReceivedMessageAction)
  @ImmutableContext()
  ReceivedMessageAction({setState, getState}: StateContext<StateModel>, {payload}: ReceivedMessageAction) {
    setState((state: StateModel) => {
      state.messages = state.messages || [];
      state.displayCount = state.displayCount || 6;
      state.displayCount = state.displayCount < 1 ? 1 : state.displayCount;
      state.messages = [payload].concat(state.messages.slice(0, state.displayCount));
      return state;
    });
  }

}
