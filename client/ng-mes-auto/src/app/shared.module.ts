import {A11yModule} from '@angular/cdk/a11y';
import {OverlayModule} from '@angular/cdk/overlay';
import {CdkTableModule} from '@angular/cdk/table';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule, MatBadgeModule, MatButtonModule, MatButtonToggleModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDialogModule, MatGridListModule, MatIconModule, MatInputModule, MatListModule, MatMenuModule, MatPaginatorModule, MatProgressBarModule, MatRippleModule, MatSelectModule, MatSidenavModule, MatSnackBarModule, MatSortModule, MatStepperModule, MatTableModule, MatTabsModule, MatToolbarModule, MatTooltipModule} from '@angular/material';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {TranslateModule} from '@ngx-translate/core';
import {NgxsDispatchPluginModule} from '@ngxs-labs/dispatch-decorator';
import {NgxsEmitPluginModule} from '@ngxs-labs/emitter';
import {NgxsFormPluginModule} from '@ngxs/form-plugin';
import {NgxsRouterPluginModule} from '@ngxs/router-plugin';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';

@NgModule({
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    // OwlMomentDateTimeModule,

    TranslateModule,
    FlexLayoutModule,
    OverlayModule,
    A11yModule,
    MatRippleModule,
    MatBadgeModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatIconModule,
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
    // {provide: DateTimeAdapter, useClass: MomentDateTimeAdapter},
  ],
})
export class SharedModule {
}
