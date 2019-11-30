import {ChangeDetectionStrategy, Component, NgModule, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {NgxsModule, Select} from '@ngxs/store';
import {Observable} from 'rxjs';
import {Batch} from '../../../models/batch';
import {PAGE_SIZE_OPTIONS} from '../../../services/util.service';
import {SharedModule} from '../../../shared.module';
import {BatchManagePageState} from '../batch-manage-page/batch-manage-page.state';
import {OperatorGroupManagePageState} from './operator-group-manage-page.state';


@Component({
  templateUrl: './operator-group-manage-page.component.html',
  styleUrls: ['./operator-group-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperatorGroupManagePageComponent implements OnInit {
  readonly displayedColumns = ['code', 'number', 'rowAndCol', 'type', 'btns'];
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  @Select(BatchManagePageState.batches)
  readonly batches$: Observable<Batch[]>;
  readonly searchForm = this.fb.group({
    q: null,
  });

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
  }

  create() {
  }

  batchCreate() {
  }
}

@NgModule({
  declarations: [
    OperatorGroupManagePageComponent,
  ],
  imports: [
    NgxsModule.forFeature([OperatorGroupManagePageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: OperatorGroupManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
