import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NgxsModule} from '@ngxs/store';
import {ConfigRootPageComponent} from './pages/config-root-page/config-root-page.component';
import {SilkCarManagePageComponent} from './pages/silk-car-manage-page/silk-car-manage-page.component';
import {SharedModule} from './shared.module';
import {SilkCarManagePageState} from './store/silk-car-manage-page.state';

const routes: Routes = [
  {
    path: '',
    component: ConfigRootPageComponent,
    children: [
      {path: 'silkCars', component: SilkCarManagePageComponent, data: {animation: 'FilterPage'}},
      // {path: '', redirectTo: '/silkCars', pathMatch: 'full'},
    ]
  },
];

@NgModule({
  declarations: [
    ConfigRootPageComponent,
    SilkCarManagePageComponent,
  ],
  imports: [
    NgxsModule.forFeature([SilkCarManagePageState]),
    SharedModule,
    RouterModule.forChild(routes),
  ]
})
export class ConfigModule {
}
