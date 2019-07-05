import {ChangeDetectionStrategy, Component, NgModule, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {NgxsModule, Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {SapT001l} from '../../../models/sapT001l';
import {SharedModule} from '../../../shared.module';
import {InitAction, SapT001lManagePageState} from '../../../store/sap-t001l-manage-page.state';

@Component({
  templateUrl: './sap-t001l-manage-page.component.html',
  styleUrls: ['./sap-t001l-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SapT001lManagePageComponent implements OnInit {
  readonly displayedColumns = ['lgort', 'lgobe', 'btns'];
  @Select(SapT001lManagePageState.sapT001ls)
  readonly sapT001ls$: Observable<SapT001l[]>;
  readonly searchForm = this.fb.group({
    q: null,
  });

  constructor(private store: Store,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.store.dispatch(new InitAction());
  }

  create() {
  }

  batchCreate() {
  }

  update(row: SapT001l) {

  }
}

@NgModule({
  declarations: [
    SapT001lManagePageComponent,
  ],
  imports: [
    NgxsModule.forFeature([SapT001lManagePageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: SapT001lManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
