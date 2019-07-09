import {Injectable} from '@angular/core';
import {MatPaginatorIntl} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class MyPaginatorIntl extends MatPaginatorIntl {
  constructor(private translate: TranslateService) {
    super();
    translate.onLangChange.subscribe(this.init);
  }

  init(): void {
    console.log('itemsPerPageLabel', this.translate);

    const keys = ['itemsPerPageLabel', 'nextPageLabel', 'previousPageLabel', 'firstPageLabel', 'lastPageLabel']
      .map(it => 'PaginatorIntl.' + it);
    this.translate.get(keys).subscribe(([itemsPerPageLabel, nextPageLabel, previousPageLabel, firstPageLabel, lastPageLabel]) => {
      this.itemsPerPageLabel = itemsPerPageLabel;
      this.nextPageLabel = nextPageLabel;
      this.previousPageLabel = previousPageLabel;
      this.firstPageLabel = firstPageLabel;
      this.lastPageLabel = lastPageLabel;
      this.changes.next();
      console.log('itemsPerPageLabel', itemsPerPageLabel);
    });
  }
}
