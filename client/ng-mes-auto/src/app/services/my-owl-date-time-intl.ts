import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {OwlDateTimeIntl} from 'ng-pick-datetime';

const keys = ['cancelBtnLabel', 'setBtnLabel', 'rangeFromLabel', 'rangeToLabel'];
const translateKeyFun = it => 'OwlDateTimeIntl.' + it;

@Injectable()
export class MyOwlDateTimeIntl extends OwlDateTimeIntl {

  constructor(private translate: TranslateService) {
    super();
    this.init();
    translate.onLangChange.subscribe(this.init);
  }

  init(): void {
    console.log('OwlDateTimeIntl');
    this.translate.get(keys.map(translateKeyFun)).subscribe(translateObj => {
      keys.forEach(it => this[it] = translateObj[translateKeyFun(it)]);
      this.changes.next();
    });
  }

}
