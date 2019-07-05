import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule, Routes} from '@angular/router';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {NgxsDispatchPluginModule} from '@ngxs-labs/dispatch-decorator';
import {NgxsEmitPluginModule} from '@ngxs-labs/emitter';
import {NgxsReduxDevtoolsPluginModule} from '@ngxs/devtools-plugin';
import {NgxsFormPluginModule} from '@ngxs/form-plugin';
import {NgxsLoggerPluginModule} from '@ngxs/logger-plugin';
import {NgxsRouterPluginModule} from '@ngxs/router-plugin';
import {NgxsStoragePluginModule} from '@ngxs/storage-plugin';
import {NgxsModule, NoopNgxsExecutionStrategy} from '@ngxs/store';
import {environment} from '../environments/environment';
import {BarcodeDialogComponent} from './components/barcode-dialog/barcode-dialog.component';
import {QrcodeDialogComponent} from './components/qrcode-dialog/qrcode-dialog.component';
import {AppNavbarComponent} from './pages/app/app-navbar/app-navbar.component';
import {AppShellComponent} from './pages/app/app-shell/app-shell.component';
import {AppComponent} from './pages/app/app.component';
import {LoginPageComponent} from './pages/app/login-page/login-page.component';
import {AdminGuard} from './services/admin.guard';
import {AuthGuard} from './services/auth.guard';
import {ErrorInterceptor} from './services/error.interceptor';
import {JwtInterceptor} from './services/jwt.interceptor';
import {SharedModule} from './shared.module';
import {AppState} from './store/app.state';
import {SilkCarRuntimePageState} from './store/silk-car-runtime-page.state';

const routes: Routes = [
  {path: 'login', component: LoginPageComponent},
  {
    path: '',
    component: AppShellComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'silkCarRuntime',
        loadChildren: () => import('./pages/silk-car-runtime-page/silk-car-runtime-page.component').then(it => it.Module),
      },
      {
        path: 'silkCarRecord',
        loadChildren: () => import('./pages/silk-car-record-page/silk-car-record-page.component').then(it => it.Module),
      },
      {
        path: 'config',
        children: [
          {
            path: 'workshops',
            loadChildren: () => import('./pages/config/workshop-manage-page/workshop-manage-page.component').then(it => it.Module),
          },
          {
            path: 'lines',
            loadChildren: () => import('./pages/config/line-manage-page/line-manage-page.component').then(it => it.Module),
          },
          {
            path: 'silkCars',
            loadChildren: () => import('./pages/config/silk-car-manage-page/silk-car-manage-page.component').then(it => it.Module),
          },
          {
            path: 'batches',
            loadChildren: () => import('./pages/config/batch-manage-page/batch-manage-page.component').then(it => it.Module),
          },
          {
            path: 'packageClasses',
            loadChildren: () => import('./pages/config/package-class-manage-page/package-class-manage-page.component').then(it => it.Module),
          },
        ]
      },
      {
        path: 'report',
        children: [
          {
            path: 'workshops',
            loadChildren: () => import('./pages/config/workshop-manage-page/workshop-manage-page.component').then(it => it.Module),
          },
        ]
      },
      {
        path: 'admin',
        canActivate: [AdminGuard],
        children: [
          {
            path: 'sapT001ls',
            loadChildren: () => import('./pages/admin/sap-t001l-manage-page/sap-t001l-manage-page.component').then(it => it.Module),
          },
          {
            path: 'operators',
            loadChildren: () => import('./pages/admin/operator-manage-page/operator-manage-page.component').then(it => it.Module),
          },
          {
            path: 'operatorGroups',
            loadChildren: () => import('./pages/admin/operator-group-manage-page/operator-group-manage-page.component').then(it => it.Module),
          },
        ]
      },
      {
        path: 'test/animation01',
        loadChildren: () => import('./pages/test/animation01-page/animation01-page.component').then(it => it.Module),
      },
      {
        path: 'test/animation02',
        loadChildren: () => import('./pages/test/animation02-page/animation02-page.component').then(it => it.Module),
      },
      {
        path: 'test/animation03',
        loadChildren: () => import('./pages/test/animation03-page/animation03-page.component').then(it => it.Module),
      },
      // {path: 'print', loadChildren: './print.module#PrintModule'},
      // {path: 'silkCar', loadChildren: './silk-car.module#SilkCarModule'},
      // {path: 'productPlan', loadChildren: './product-plan.module#ProductPlanModule'},
      // {path: 'report', loadChildren: './report.module#ReportModule'},
      // {path: 'admin', loadChildren: './admin.module#AdminModule', canActivate: [AdminGuard]},
      {path: '', redirectTo: '/silkCarRuntime', pathMatch: 'full'},
    ]
  },
];

export function createTranslateLoader(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    AppShellComponent,
    AppNavbarComponent,
    BarcodeDialogComponent,
    QrcodeDialogComponent,
  ],
  entryComponents: [
    BarcodeDialogComponent,
    QrcodeDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    NgxsModule.forRoot([AppState, SilkCarRuntimePageState], {
      developmentMode: !environment.production,
      executionStrategy: NoopNgxsExecutionStrategy,
    }),
    // It is recommended to register the storage plugin before other plugins so initial state can be picked up by those plugins.
    NgxsStoragePluginModule.forRoot({
      key: ['app.token', 'SilkCarRuntimePage.settingForm']
    }),
    NgxsRouterPluginModule.forRoot(),
    NgxsFormPluginModule.forRoot(),
    NgxsDispatchPluginModule.forRoot(),
    NgxsEmitPluginModule.forRoot(),
    SharedModule,
    RouterModule.forRoot(routes, {useHash: true}),
    // You should always include the logger as the last plugin in your configuration.
    NgxsLoggerPluginModule.forRoot({
      disabled: environment.production
    }),
    // You should always include the devtools as the last plugin in your configuration.
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production
    }),
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
