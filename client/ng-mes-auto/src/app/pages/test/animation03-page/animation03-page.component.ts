import {animate, keyframes, state, style, transition, trigger} from '@angular/animations';
import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../../../shared.module';

@Component({
  templateUrl: './animation03-page.component.html',
  styleUrls: ['./animation03-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('openClose', [
      state('open', style({
        height: '200px',
        opacity: 1,
        backgroundColor: 'yellow'
      })),
      state('closed', style({
        height: '100px',
        opacity: 0.5,
        backgroundColor: 'green'
      })),
      transition('* => closed', [
        animate('2s', keyframes([
          style({backgroundColor: 'blue', offset: 0}),
          style({backgroundColor: 'red', offset: 0.8}),
          style({backgroundColor: 'orange', offset: 1.0})
        ])),
      ]),
      transition('* => open', [
        animate('2s', keyframes([
          style({backgroundColor: 'orange', offset: 0}),
          style({backgroundColor: 'red', offset: 0.2}),
          style({backgroundColor: 'blue', offset: 1.0})
        ]))
      ]),
      // transition('* => *', [
      //   animate('1s')
      // ]),
    ]),
  ],
})
export class Animation03PageComponent {
  isOpen = true;

  toggle() {
    this.isOpen = !this.isOpen;
  }
}

@NgModule({
  declarations: [
    Animation03PageComponent,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {path: '', component: Animation03PageComponent, data: {animation: 'AboutPage'}},
    ]),
  ],
})
export class Module {
}
