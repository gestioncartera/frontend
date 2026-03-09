import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: '', // Al estar dentro del padre 'caja', esto representa localhost:4200/caja
    redirectTo: 'cerrar-caja',
    pathMatch: 'full',
  },
  {
    path: 'cerrar-caja', // Esto completa la URL: /caja/cerrar-caja
    loadComponent: () => import('./cerrar-caja/cerrar-caja.component').then(m => m.CerrarCajaComponent),
    data: { title: 'Cierre de Caja' }
  },
  {
    path: 'abrir-caja', // Esto completa la URL: /caja/abrir-caja
    loadComponent: () => import('./abrir-caja/abrir-caja.component').then(m => m.AbrirCajaComponent),
    data: { title: 'Abrir Caja' }
  }
];