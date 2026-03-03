import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'apertura-caja',
    pathMatch: 'full',
  },
  {
    path: 'apertura-caja',
    loadComponent: () =>
      import('./apertura-caja/apertura-caja.component').then(
        (m) => m.AperturaCajaComponent
      ),
    data: { title: 'Apertura de Caja' },
  },
   
   
];
