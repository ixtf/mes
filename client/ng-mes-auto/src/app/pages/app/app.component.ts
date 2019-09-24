import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {Apollo, Query} from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(private title: Title,
              private translate: TranslateService,
              private apollo: Apollo) {
    this.translate.setDefaultLang('zh_CN');
    this.translate.get('title').subscribe(it => title.setTitle(it));
    this.apollo.watchQuery<Query>({
      query: gql`
        query {
          listOperator(first:300,pageSize:5){
              first
              pageSize
              count
              operators{
                  id
                  name
                  hrId
              }
          }
        }
      `,
    }).valueChanges.pipe().subscribe(it => {
      console.log('test', it);
    });
  }
}
