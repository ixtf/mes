import {FullscreenOverlayContainer, OverlayContainer} from '@angular/cdk/overlay';
import {registerLocaleData} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import localeZhHans from '@angular/common/locales/zh-Hans';
import {LOCALE_ID, NgModule} from '@angular/core';
import {DateAdapter, MAT_AUTOCOMPLETE_DEFAULT_OPTIONS, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatPaginatorIntl} from '@angular/material';
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {NgxsDispatchPluginModule} from '@ngxs-labs/dispatch-decorator';
import {NgxsEmitPluginModule} from '@ngxs-labs/emitter';
import {NgxsReduxDevtoolsPluginModule} from '@ngxs/devtools-plugin';
import {NgxsFormPluginModule} from '@ngxs/form-plugin';
import {NgxsLoggerPluginModule} from '@ngxs/logger-plugin';
import {NgxsRouterPluginModule} from '@ngxs/router-plugin';
import {NgxsStoragePluginModule} from '@ngxs/storage-plugin';
import {NgxsModule, NoopNgxsExecutionStrategy} from '@ngxs/store';
import {OWL_DATE_TIME_LOCALE, OwlDateTimeIntl} from 'ng-pick-datetime';
import {environment} from '../environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {ConfirmDialogComponent} from './components/confirm-dialog/confirm-dialog.component';
import {AppNavbarComponent} from './pages/app/app-navbar/app-navbar.component';
import {BoardAbnormalDialogComponent} from './pages/app/app-navbar/board-abnormal-dialog/board-abnormal-dialog.component';
import {BoardAutoLineDialogComponent} from './pages/app/app-navbar/board-auto-line-dialog/board-auto-line-dialog.component';
import {BoardAutoLineJikonAdapterDialogComponent} from './pages/app/app-navbar/board-auto-line-jikon-adapter-dialog/board-auto-line-jikon-adapter-dialog.component';
import {BoardSilkCarRuntimeDialogComponent} from './pages/app/app-navbar/board-silk-car-runtime-dialog/board-silk-car-runtime-dialog.component';
import {UnbudatPackageBoxDialogComponent} from './pages/app/app-navbar/unbudat-package-box-dialog/unbudat-package-box-dialog.component';
import {AppShellComponent} from './pages/app/app-shell/app-shell.component';
import {AppComponent} from './pages/app/app.component';
import {LoginPageComponent} from './pages/app/login-page/login-page.component';
import {ErrorInterceptor} from './services/error.interceptor';
import {JwtInterceptor} from './services/jwt.interceptor';
import {MyOwlDateTimeIntl} from './services/my-owl-date-time-intl';
import {MyPaginatorIntl} from './services/my-paginator-intl';
import {SharedModule} from './shared.module';
import {AppState} from './store/app.state';
import {DoffingSilkCarRecordReportPageState} from './store/doffing-silk-car-record-report-page.state';
import {DyeingReportPageState} from './store/dyeing-report-page.state';
import {DyeingResultsTimelinePageState} from './store/dyeing-results-timeline-page.state';
import {InspectionReportPageState} from './store/inspection-report-page.state';
import {LineManagePageState} from './store/line-manage-page.state';
import {PackageBoxManagePageState} from './store/package-box-manage-page.state';
import {ProductPlanReportPageState} from './store/product-plan-report-page.state';
import {SilkExceptionReportPageState} from './store/silk-exception-report-page.state';
import {StatisticReportDayPageState} from './store/statistic-report-day-page.state';
import {StatisticReportRangePageState} from './store/statistic-report-range-page.state';
import {StrippingReportPageState} from './store/stripping-report-page.state';
import {ToDtyConfirmReportPageState} from './store/to-dty-confirm-report-page.state';
import {ToDtyReportPageState} from './store/to-dty-report-page.state';

registerLocaleData(localeZhHans, 'zh-Hans');

export function createTranslateLoader(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    AppShellComponent,
    AppNavbarComponent,
    ConfirmDialogComponent,
    BoardAutoLineDialogComponent,
    BoardAutoLineJikonAdapterDialogComponent,
    BoardAbnormalDialogComponent,
    BoardSilkCarRuntimeDialogComponent,
    UnbudatPackageBoxDialogComponent,
  ],
  entryComponents: [
    ConfirmDialogComponent,
    BoardAutoLineDialogComponent,
    BoardAutoLineJikonAdapterDialogComponent,
    BoardAbnormalDialogComponent,
    BoardSilkCarRuntimeDialogComponent,
    UnbudatPackageBoxDialogComponent,
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
    NgxsModule.forRoot([AppState], {
      developmentMode: !environment.production,
      executionStrategy: NoopNgxsExecutionStrategy,
    }),
    // It is recommended to register the storage plugin before other plugins so initial state can be picked up by those plugins.
    NgxsStoragePluginModule.forRoot({
      key: [
        ...AppState.storageIds(),
        ...ProductPlanReportPageState.storageIds(),
        ...LineManagePageState.storageIds(),
        ...PackageBoxManagePageState.storageIds(),
        ...DoffingSilkCarRecordReportPageState.storageIds(),
        ...StatisticReportDayPageState.storageIds(),
        ...StatisticReportRangePageState.storageIds(),
        ...StrippingReportPageState.storageIds(),
        ...InspectionReportPageState.storageIds(),
        ...DyeingReportPageState.storageIds(),
        ...SilkExceptionReportPageState.storageIds(),
        ...ToDtyReportPageState.storageIds(),
        ...ToDtyConfirmReportPageState.storageIds(),
        ...DyeingResultsTimelinePageState.storageIds(),
      ],
    }),
    NgxsRouterPluginModule.forRoot(),
    NgxsFormPluginModule.forRoot(),
    NgxsDispatchPluginModule.forRoot(),
    NgxsEmitPluginModule.forRoot(),
    // You should always include the logger as the last plugin in your configuration.
    NgxsLoggerPluginModule.forRoot({
      disabled: environment.production
    }),
    // You should always include the devtools as the last plugin in your configuration.
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production
    }),
    SharedModule,
    AppRoutingModule,
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    {provide: LOCALE_ID, useValue: 'zh-Hans'},
    {provide: MAT_DATE_LOCALE, useValue: 'zh-CN'},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
    {provide: MAT_AUTOCOMPLETE_DEFAULT_OPTIONS, useValue: {autoActiveFirstOption: true}},
    {provide: MatPaginatorIntl, useClass: MyPaginatorIntl, deps: [TranslateService]},
    {provide: OverlayContainer, useClass: FullscreenOverlayContainer},
    {provide: OWL_DATE_TIME_LOCALE, useValue: 'zh-CN'},
    {provide: OwlDateTimeIntl, useClass: MyOwlDateTimeIntl, deps: [TranslateService]},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
