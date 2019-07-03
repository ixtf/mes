import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(private title: Title,
              private translate: TranslateService) {
    this.translate.setDefaultLang('zh_CN');
    this.translate.get('title').subscribe(it => title.setTitle(it));
  }
}
