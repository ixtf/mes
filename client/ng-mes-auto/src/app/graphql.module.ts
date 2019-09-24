import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {Apollo, ApolloModule} from 'apollo-angular';
import {HttpLink, HttpLinkModule} from 'apollo-angular-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';

const uri = 'http://localhost:8080/graphql';

@NgModule({
  exports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule,
  ],
})
export class GraphQLModule {
  constructor(
    apollo: Apollo,
    httpLink: HttpLink,
  ) {
    // create Apollo
    apollo.create({
      link: httpLink.create({uri}),
      cache: new InMemoryCache(),
    });
  }
}
