import {ChangeDetectionStrategy, Component, NgModule, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {NgxsModule, Select} from '@ngxs/store';
import {Observable} from 'rxjs';
import {SilkCar} from '../../models/silk-car';
import {PAGE_SIZE_OPTIONS} from '../../services/util.service';
import {SharedModule} from '../../shared.module';
import {SilkCarManagePageState} from '../../store/silk-car-manage-page.state';


@Component({
  templateUrl: './silk-car-manage-page.component.html',
  styleUrls: ['./silk-car-manage-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkCarManagePageComponent implements OnInit {
  readonly displayedColumns = ['code', 'number', 'rowAndCol', 'type', 'btns'];
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  @Select(SilkCarManagePageState.silkCars)
  readonly silkCars$: Observable<SilkCar>;
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
    SilkCarManagePageComponent,
  ],
  imports: [
    NgxsModule.forFeature([SilkCarManagePageState]),
    SharedModule,
    RouterModule.forChild([
      {path: '', component: SilkCarManagePageComponent, data: {animation: 'FilterPage'}},
    ]),
  ],
})
export class Module {
}
