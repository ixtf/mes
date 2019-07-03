import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';
import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../../../shared.module';

@Component({
  templateUrl: './animation01-page.component.html',
  styleUrls: ['./animation01-page.component.less'],
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
        animate('1s')
      ]),
      transition('* => open', [
        animate('0.5s')
      ]),
    ]),
  ],
})
export class Animation01PageComponent {
  isOpen = true;

  toggle() {
    this.isOpen = !this.isOpen;
  }

  onAnimationEvent(event: AnimationEvent) {
    console.log(event);

    // openClose is trigger name in this example
    console.warn(`Animation Trigger: ${event.triggerName}`);

    // phaseName is start or done
    console.warn(`Phase: ${event.phaseName}`);

    // in our example, totalTime is 1000 or 1 second
    console.warn(`Total time: ${event.totalTime}`);

    // in our example, fromState is either open or closed
    console.warn(`From: ${event.fromState}`);

    // in our example, toState either open or closed
    console.warn(`To: ${event.toState}`);

    // the HTML element itself, the button in this case
    console.warn(`Element: ${event.element}`);
  }
}

@NgModule({
  declarations: [
    Animation01PageComponent,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {path: '', component: Animation01PageComponent},
    ]),
  ],
})
export class Module {
}
