import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'list-gasto',
        pathMatch: 'full'
    },
    {
        path: 'list-gasto',
        loadComponent: () => import('./list-gasto/list-gasto.component').then(m => m.ListGastoComponent),
        data: { title: 'Lista de Gastos' }
    },
    {
        path: 'crear-gasto',
        loadComponent: () => import('./crear-gasto/crear-gasto.component').then(m => m.CrearGastoComponent),
        data: { title: 'Crear Gasto' }
    },
    {
        path: 'registro-egreso-suc',
        loadComponent: () => import('./registro-egreso-suc/registro-egreso-suc.component').then(m => m.RegistroEgresoSucComponent),
        data: { title: 'Registrar Egreso' }
    },
    {
        path: 'registro-egreso-diario',
        loadComponent: () => import('./registro-egreso-diario/registro-egreso-diario.component').then(m => m.RegistroEgresoDiarioComponent),
        data: { title: 'Registrar Egreso Diario' }
    },
    {
        path: 'list-gasto-diario',
        loadComponent: () => import('./list-gasto-diario/list-gasto-diario.component').then(m => m.ListGastoDiarioComponent),
        data: { title: 'Lista de Gastos Diarios' }
    },
]
