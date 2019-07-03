import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  templateUrl: './config-root-page.component.html',
  styleUrls: ['./config-root-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigRootPageComponent {
}
