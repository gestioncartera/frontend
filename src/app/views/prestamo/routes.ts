import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: { title: 'Préstamo' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../cliente/list-cliente/list-cliente.component').then(
            (m) => m.ListClienteComponent
          ),
        data: { title: 'Gestión de Préstamos', mode: 'selectForLoan' },
      },
      {
        path: 'prestamos-cliente/:cliente_id',
        loadComponent: () =>
          import('./prestamos-cliente/prestamos-cliente.component').then(
            (m) => m.PrestamosClienteComponent
          ),
        data: { title: 'Préstamos del Cliente' },
      },
      {
        path: 'list-prestamo',
        loadComponent: () =>
          import('./list-prestamo/list-prestamo.component').then(
            (m) => m.ListPrestamoComponent
          ),
        data: { title: 'Lista de Préstamos' },
      },
      {
        path: 'crear-prestamo',
        loadComponent: () =>
          import('./crear-prestamo/crear-prestamo.component').then(
            (m) => m.CrearPrestamoComponent
          ),
        data: { title: 'Crear Préstamo' },
      },
      {
        path: 'detalle-prestamo/:id',
        loadComponent: () =>
          import('./detalle-prestamo/detalle-prestamo.component').then(
            (m) => m.DetallePrestamoComponent
          ),
        data: { title: 'Detalle de Préstamo' },
      },
      {
        path: 'tipo-prestamo',
        loadComponent: () =>
          import('./tipo-prestamo/tipo-prestamo.component').then(
            (m) => m.TipoPrestamoComponent
          ),
        data: { title: 'Tipo de Préstamo' },
      },
      {
        path: 'tipo-prestamo/:id',
        loadComponent: () =>
          import('./tipo-prestamo/tipo-prestamo.component').then(
            (m) => m.TipoPrestamoComponent
          ),
        data: { title: 'Editar Tipo de Préstamo' },
      },
      {
        path: 'list-tipo',
        loadComponent: () =>
          import('./list-tipo/list-tipo.component').then(
            (m) => m.ListTipoComponent
          ),
        data: { title: 'Lista de Tipos de Préstamo' },
      },
      {
        path: 'aprobar-prestamo',
        loadComponent: () =>
          import('./aprobar-prestamo/aprobar-prestamo.component').then(
            (m) => m.AprobarPrestamoComponent
          ),
        data: { title: 'Aprobar Préstamos' },
      },
       
    ],
  },
];