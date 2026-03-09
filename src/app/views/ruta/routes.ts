import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Rutas',
    },
    children: [
      {
        path: '',
        redirectTo: 'list-ruta',
        pathMatch: 'full',
      },
      {
          path: 'rutas',
          loadComponent: () =>
            import('./list-ruta/list-ruta.component')
              .then(m => m.ListRutaComponent),
          data: { mode: 'admin' }
        },

        // COBRADOR
        {
          path: 'mis-rutas',
          loadComponent: () =>
            import('./list-ruta/list-ruta.component')
              .then(m => m.ListRutaComponent),
          data: { mode: 'cobrador' }
        },
      {
        path: 'list-ruta',
        loadComponent: () =>
          import('./list-ruta/list-ruta.component').then(
            (m) => m.ListRutaComponent
          ),
        data: {
          title: 'Lista de Rutas',
        },
      },
      {
        path: 'crear-ruta',
        loadComponent: () =>
          import('./crear-ruta/crear-ruta.component').then(
            (m) => m.CrearRutaComponent
          ),
        data: {
          title: 'Crear Ruta',
        },
      },
      {
        path: 'asignar-ruta',
        loadComponent: () =>
          import('./asignar-ruta/asignar-ruta.component').then(
            (m) => m.AsignarRutaComponent
          ),
        data: {
          title: 'Ordenar Ruta',
        },
      },
      {
        path: 'edit-ruta/:id',
        loadComponent: () =>
          import('./edit-ruta/edit-ruta.component').then(
            (m) => m.EditRutaComponent
          ),
        data: {
          title: 'Editar Ruta',
        },
      },
    ],
  },
];