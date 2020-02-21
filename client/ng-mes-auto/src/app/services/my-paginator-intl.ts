import {Injectable} from '@angular/core';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {TranslateService} from '@ngx-translate/core';

const keys = ['itemsPerPageLabel', 'nextPageLabel', 'previousPageLabel', 'firstPageLabel', 'lastPageLabel'];
const translateKeyFun = it => 'PaginatorIntl.' + it;

@Injectable()
export class MyPaginatorIntl extends MatPaginatorIntl {

  constructor(private translate: TranslateService) {
    super();
    this.init();
    translate.onLangChange.subscribe(this.init);
  }

  init(): void {
    this.translate.get(keys.map(translateKeyFun)).subscribe(translateObj => {
      keys.forEach(it => this[it] = translateObj[translateKeyFun(it)]);
      this.changes.next();
    });
  }

}
