import { Routes } from '@angular/router';
import { Reporte1Component } from './reporte1/reporte1.component';
import { Reporte2Component } from './reporte2/reporte2.component';
import {CajaMayorComponent}   from './caja-mayor/caja-mayor.component'
 export const routes: Routes = [
  {
    path: 'reporte1',
    component: Reporte1Component
  },
  {
    path: 'reporte2',
    component: Reporte2Component
  },

   {
    path: 'caja-mayor',
    component: CajaMayorComponent
  }
];
