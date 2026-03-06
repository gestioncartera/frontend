import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { sucursalGuard } from './guards/sucursal.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'cambio-sucursal',
    loadComponent: () =>
      import('./views/sucursal/cambio-sucursal/cambio-sucursal.component').then(
        (m) => m.CambioSucursalComponent
      ),
    canActivate: [authGuard],
    data: {
      title: 'Selección de Sucursal',
    },
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout').then((m) => m.DefaultLayoutComponent),
    canActivate: [authGuard, sucursalGuard], // Proteger todas las rutas hijas
    data: {
      title: 'Home',
    },
    children: [
      {
        path: 'ruta',
        loadChildren: () => import('./views/ruta/routes').then((m) => m.routes),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./views/sucursal/routes').then((m) => m.routes),
      },
      {
        path: 'theme',
        loadChildren: () =>
          import('./views/theme/routes').then((m) => m.routes),
      },
      {
        path: 'base',
        loadChildren: () => import('./views/base/routes').then((m) => m.routes),
      },
      {
        path: 'buttons',
        loadChildren: () =>
          import('./views/buttons/routes').then((m) => m.routes),
      },
      {
        path: 'forms',
        loadChildren: () =>
          import('./views/forms/routes').then((m) => m.routes),
      },
      {
        path: 'icons',
        loadChildren: () =>
          import('./views/icons/routes').then((m) => m.routes),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./views/notifications/routes').then((m) => m.routes),
      },
      {
        path: 'widgets',
        loadChildren: () =>
          import('./views/widgets/routes').then((m) => m.routes),
      },
      {
        path: 'charts',
        loadChildren: () =>
          import('./views/charts/routes').then((m) => m.routes),
      },
      {
        path: 'pages',
        loadChildren: () =>
          import('./views/pages/routes').then((m) => m.routes),
      },
      {
        path: 'periodo',
        loadChildren: () =>
          import('./views/periodo/routes').then((m) => m.routes),
      },
      {
        path: 'cliente',
        loadChildren: () => import('./views/cliente/routes').then((m) => m.routes),
      },
      {
        path: 'prestamo',
        loadChildren: () =>
          import('./views/prestamo/routes').then((m) => m.routes),
      },
      {
        path: 'sucursal',
        loadChildren: () =>
          import('./views/sucursal/routes').then((m) => m.routes),
      },
      {
        path: 'cobro',
        loadChildren: () =>
          import('./views/cobro/routes').then((m) => m.routes),
      },
      {
        path: 'gasto',
        loadChildren: () =>
          import('./views/gasto/routes').then((m) => m.routes),
      },
      {
        path: 'usuario',
        loadChildren: () =>
          import('./views/usuario/routes').then((m) => m.routes),
      },
      {
        path: 'tarjeta',
        loadChildren: () =>
          import('./views/tarjeta/routes').then((m) => m.routes),
      },
      {
        path: 'caja',
        loadChildren: () => import('./views/caja/routes').then((m) => m.routes),
      },
    ],
  },
  {
    path: '404',
    loadComponent: () =>
      import('./views/pages/page404/page404.component').then(
        (m) => m.Page404Component
      ),
    data: {
      title: 'Page 404',
    },
  },
  {
    path: '500',
    loadComponent: () =>
      import('./views/pages/page500/page500.component').then(
        (m) => m.Page500Component
      ),
    data: {
      title: 'Page 500',
    },
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./views/pages/login/login.component').then(
        (m) => m.LoginComponent
      ),
    data: {
      title: 'Login Page',
    },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./views/pages/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    data: {
      title: 'Register Page',
    },
  },
  { path: '**', redirectTo: 'dashboard' },
];
