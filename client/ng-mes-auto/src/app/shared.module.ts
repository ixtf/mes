import {A11yModule} from '@angular/cdk/a11y';
import {FullscreenOverlayContainer, OverlayContainer, OverlayModule} from '@angular/cdk/overlay';
import {CdkTableModule} from '@angular/cdk/table';
import {CommonModule, registerLocaleData} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import localeZhHans from '@angular/common/locales/zh-Hans';
import {LOCALE_ID, NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatAutocompleteModule,
  MatBadgeModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatSelectModule,
  MatSidenavModule,
  MatSnackBarModule, MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {NgxsDispatchPluginModule} from '@ngxs-labs/dispatch-decorator';
import {NgxsEmitPluginModule} from '@ngxs-labs/emitter';
import {NgxsFormPluginModule} from '@ngxs/form-plugin';
import {NgxsRouterPluginModule} from '@ngxs/router-plugin';
// import {NgxPrintModule} from 'ngx-print';
// import {MyPaginatorIntl} from './services/my-paginator-intl';

registerLocaleData(localeZhHans, 'zh-Hans');

@NgModule({
  exports: [
    // NgxPrintModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    FlexLayoutModule,
    OverlayModule,
    A11yModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatToolbarModule,
    MatIconModule,
    MatDatepickerModule,
    MatPaginatorModule,
    MatSidenavModule,
    CdkTableModule,
    MatTableModule,
    MatSortModule,
    MatTabsModule,
    MatMenuModule,
    MatChipsModule,
    MatBadgeModule,
    MatGridListModule,
    MatStepperModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatCardModule,
    MatListModule,

    NgxsRouterPluginModule,
    NgxsFormPluginModule,
    NgxsDispatchPluginModule,
    NgxsEmitPluginModule,
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'zh-Hans'},
    {provide: MAT_DATE_LOCALE, useValue: 'zh-CN'},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
    // {provide: MatPaginatorIntl, useClass: MyPaginatorIntl},
    {provide: OverlayContainer, useClass: FullscreenOverlayContainer}
  ]
})
export class SharedModule {
}
