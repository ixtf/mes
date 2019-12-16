import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AppShellComponent} from './pages/app/app-shell/app-shell.component';
import {LoginPageComponent} from './pages/app/login-page/login-page.component';
import {AdminGuard} from './services/admin.guard';
import {AuthGuard} from './services/auth.guard';

const routes: Routes = [
  {path: 'login', component: LoginPageComponent},
  {
    path: 'board',
    children: [
      {path: 'auto-line-jikon-adapter', loadChildren: () => import('./pages/board/board-auto-line-jikon-adapter-page/board-auto-line-jikon-adapter-page.component').then(it => it.Module)},
      {path: 'auto-line', loadChildren: () => import('./pages/board/board-auto-line-page/board-auto-line-page.component').then(it => it.Module)},
      {path: 'abnormal', loadChildren: () => import('./pages/board/board-abnormal-page/board-abnormal-page.component').then(it => it.Module)},
      {path: 'silk-car-runtime', loadChildren: () => import('./pages/board/board-silk-car-runtime-page/board-silk-car-runtime-page.component').then(it => it.Module)},
      {path: 'test', loadChildren: () => import('./pages/board/board-test-page/board-test-page.component').then(it => it.Module)},
    ]
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [AuthGuard],
    children: [
      {path: 'silkCarRuntime', loadChildren: () => import('./pages/silk-car-runtime-page/silk-car-runtime-page.component').then(it => it.Module)},
      {path: 'silkCarRecord', loadChildren: () => import('./pages/silk-car-record-page/silk-car-record-page.component').then(it => it.Module)},
      {path: 'unbudatPackageBoxes', loadChildren: () => import('./pages/unbudat-package-box-manage-page/unbudat-package-box-manage-page.component').then(it => it.Module)},
      {path: 'packageBoxes', loadChildren: () => import('./pages/package-box-manage-page/package-box-manage-page.component').then(it => it.Module)},
      {path: 'exceptionRecords', loadChildren: () => import('./pages/exception-record-manage-page/exception-record-manage-page.component').then(it => it.Module)},
      {path: 'notifications', loadChildren: () => import('./pages/notification-manage-page/notification-manage-page.component').then(it => it.Module)},
      {
        path: 'config',
        children: [
          {path: 'workshops', loadChildren: () => import('./pages/config/workshop-manage-page/workshop-manage-page.component').then(it => it.Module)},
          {path: 'lines', loadChildren: () => import('./pages/config/line-manage-page/line-manage-page.component').then(it => it.Module)},
          {path: 'lineMachines', loadChildren: () => import('./pages/config/line-machine-manage-page/line-machine-manage-page.component').then(it => it.Module)},
          {path: 'silkCars', loadChildren: () => import('./pages/config/silk-car-manage-page/silk-car-manage-page.component').then(it => it.Module)},
          {path: 'batches', loadChildren: () => import('./pages/config/batch-manage-page/batch-manage-page.component').then(it => it.Module)},
          {path: 'packageClasses', loadChildren: () => import('./pages/config/package-class-manage-page/package-class-manage-page.component').then(it => it.Module)},
          {path: 'grades', loadChildren: () => import('./pages/config/grade-manage-page/grade-manage-page.component').then(it => it.Module)},
          {path: 'temporaryBoxes', loadChildren: () => import('./pages/config/temporary-box-manage-page/temporary-box-manage-page.component').then(it => it.Module)},
          {path: 'silkCarRecordDestinations', loadChildren: () => import('./pages/config/silk-car-record-destination-manage-page/silk-car-record-destination-manage-page.component').then(it => it.Module)},
        ]
      },
      {
        path: 'report',
        children: [
          {path: 'doffingSilkCarRecordReport', loadChildren: () => import('./pages/report/doffing-silk-car-record-report-page/doffing-silk-car-record-report-page.component').then(it => it.Module)},
          {path: 'productPlan', loadChildren: () => import('./pages/report/product-plan-report-page/product-plan-report-page.component').then(it => it.Module)},
          {path: 'statisticReportDay', loadChildren: () => import('./pages/report/statistic-report-day-page/statistic-report-day-page.component').then(it => it.Module)},
          {path: 'statisticReportRange', loadChildren: () => import('./pages/report/statistic-report-range-page/statistic-report-range-page.component').then(it => it.Module)},
          {path: 'strippingReport', loadChildren: () => import('./pages/report/stripping-report-page/stripping-report-page.component').then(it => it.Module)},
          {path: 'inspectionReport', loadChildren: () => import('./pages/report/inspection-report-page/inspection-report-page.component').then(it => it.Module)},
          {path: 'dyeingReport', loadChildren: () => import('./pages/report/dyeing-report-page/dyeing-report-page.component').then(it => it.Module)},
          {path: 'silkExceptionReport', loadChildren: () => import('./pages/report/silk-exception-report-page/silk-exception-report-page.component').then(it => it.Module)},
          {path: 'silkExceptionByClassReport', loadChildren: () => import('./pages/report/silk-exception-by-class-report-page/silk-exception-by-class-report-page.component').then(it => it.Module)},
          {path: 'toDtyReport', loadChildren: () => import('./pages/report/to-dty-report-page/to-dty-report-page.component').then(it => it.Module)},
          {path: 'toDtyConfirmReport', loadChildren: () => import('./pages/report/to-dty-confirm-report-page/to-dty-confirm-report-page.component').then(it => it.Module)},
          {path: 'dyeingResultsTimeline', loadChildren: () => import('./pages/report/dyeing-results-timeline-page/dyeing-results-timeline-page.component').then(it => it.Module)},
          {path: 'flip', loadChildren: () => import('./pages/report/flip-report-page/flip-report-page.component').then(it => it.Module)},
        ]
      },
      {
        path: 'admin',
        canActivate: [AdminGuard],
        children: [
          {path: 'sapT001ls', loadChildren: () => import('./pages/config/sap-t001l-manage-page/sap-t001l-manage-page.component').then(it => it.Module)},
          {path: 'operators', loadChildren: () => import('./pages/config/operator-manage-page/operator-manage-page.component').then(it => it.Module)},
          {path: 'operatorGroups', loadChildren: () => import('./pages/config/operator-group-manage-page/operator-group-manage-page.component').then(it => it.Module)},
        ]
      },
      {path: 'test/animation01', loadChildren: () => import('./pages/test/animation01-page/animation01-page.component').then(it => it.Module)},
      {path: 'test/animation02', loadChildren: () => import('./pages/test/animation02-page/animation02-page.component').then(it => it.Module)},
      {path: 'test/animation03', loadChildren: () => import('./pages/test/animation03-page/animation03-page.component').then(it => it.Module)},
      // {path: 'print', loadChildren: './print.module#PrintModule'},
      // {path: 'silkCar', loadChildren: './silk-car.module#SilkCarModule'},
      // {path: 'productPlan', loadChildren: './product-plan.module#ProductPlanModule'},
      // {path: 'report', loadChildren: './report.module#ReportModule'},
      // {path: 'admin', loadChildren: './admin.module#AdminModule', canActivate: [AdminGuard]},
      {path: '', redirectTo: '/silkCarRuntime', pathMatch: 'full'},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
