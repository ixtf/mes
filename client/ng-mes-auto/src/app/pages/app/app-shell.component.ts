import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {slideInAnimation} from '../../services/animations';

@Component({
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    slideInAnimation,
  ]
})
export class AppShellComponent {
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }
}
