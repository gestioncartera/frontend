import { AbrirCajaComponent } from './abrir-caja/abrir-caja.component';

export const routes: Routes = [
  {
    path: 'abrir-caja',
    component: AbrirCajaComponent,
  },
  {
    path: 'abrir-caja/:id',
    component: AbrirCajaComponent,
  },
  {
    path: '',
    component: AbrirCajaComponent,
  },
];