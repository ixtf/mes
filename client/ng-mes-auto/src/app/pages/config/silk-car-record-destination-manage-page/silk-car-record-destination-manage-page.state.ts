import {Injectable} from '@angular/core';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {SilkCarRecordDestination} from '../../../models/silk-car-record-destination';
import {ApiService} from '../../../services/api.service';

const PAGE_NAME = 'SilkCarRecordDestinationManagePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class SaveAction {
  static readonly type = `[${PAGE_NAME}] SaveAction`;

  constructor(public payload: SilkCarRecordDestination) {
  }
}

interface StateModel {
  silkCarRecordDestinationEntities: { [id: string]: SilkCarRecordDestination };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    silkCarRecordDestinationEntities: {},
  },
})
@Injectable()
export class SilkCarRecordDestinationManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static silkCarRecordDestinations(state: StateModel): SilkCarRecordDestination[] {
    return Object.values(state.silkCarRecordDestinationEntities);
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<StateModel>) {
    return this.api.listSilkCarRecordDestination().pipe(
      tap(silkCarRecordDestinations => setState((state: StateModel) => {
        state.silkCarRecordDestinationEntities = SilkCarRecordDestination.toEntities(silkCarRecordDestinations);
        return state;
      }))
    );
  }

  @Action(SaveAction)
  @ImmutableContext()
  SaveAction({setState}: StateContext<StateModel>, {payload}: SaveAction) {
    return this.api.saveSilkCarRecordDestination(payload).pipe(
      tap(workshop => setState((state: StateModel) => {
        state.silkCarRecordDestinationEntities[workshop.id] = workshop;
        return state;
      }))
    );
  }

}
