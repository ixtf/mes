import {ChangeDetectionStrategy, Component, NgModule, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {NgxsModule, Select} from '@ngxs/store';
import {Observable} from 'rxjs';
import {Batch} from '../../models/batch';
import {PAGE_SIZE_OPTIONS} from '../../services/util.service';
import {SharedModule} from '../../shared.module';
import {BatchManagePageState} from '../../store/batch-manage-page.state';


@Component({
  templateUrl: './batch-manage-page.component.html',
  styleUrls: ['./batch-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatchManagePageComponent implements OnInit {
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
    BatchManagePageComponent,
  ],
  imports: [
    NgxsModule.forFeature([BatchManagePageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: BatchManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
