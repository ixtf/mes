import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {Grade} from '../models/grade';
import {ApiService} from '../services/api.service';
import {SortByCompare} from '../services/util.service';

const PAGE_NAME = 'GradeManagePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class SaveAction {
  static readonly type = `[${PAGE_NAME}] SaveAction`;

  constructor(public payload: Grade) {
  }
}

interface StateModel {
  gradeEntities?: { [id: string]: Grade };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    gradeEntities: {},
  }
})
export class GradeManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static grades(state: StateModel): Grade[] {
    return Object.values(state.gradeEntities).sort(SortByCompare);
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<StateModel>) {
    return this.api.listGrade().pipe(
      tap(grades => setState((state: StateModel) => {
        state.gradeEntities = Grade.toEntities(grades);
        return state;
      }))
    );
  }

  @Action(SaveAction)
  @ImmutableContext()
  SaveAction({setState}: StateContext<StateModel>, {payload}: SaveAction) {
    return this.api.saveGrade(payload).pipe(
      tap(grade => setState((state: StateModel) => {
        state.gradeEntities[grade.id] = Grade.assign(grade);
        return state;
      }))
    );
  }

}
