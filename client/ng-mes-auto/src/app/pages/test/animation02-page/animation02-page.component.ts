import {animate, style, transition, trigger} from '@angular/animations';
import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../../../shared.module';

@Component({
  templateUrl: './animation02-page.component.html',
  styleUrls: ['./animation02-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('myInsertRemoveTrigger', [
      transition(':enter', [
        style({opacity: 0}),
        animate('5s', style({opacity: 1})),
      ]),
      transition(':leave', [
        animate('5s', style({opacity: 0}))
      ])
    ]),
  ],
})
export class Animation02PageComponent {
  isShown = true;
}

@NgModule({
  declarations: [
    Animation02PageComponent,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {path: '', component: Animation02PageComponent},
    ]),
  ],
})
export class Module {
}
