export * from './abrir-caja/abrir-caja.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbrirCajaComponent } from './abrir-caja/abrir-caja.component';

@NgModule({
  declarations: [
    AbrirCajaComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AbrirCajaComponent
  ]
})
export class AbrirCajaModule {}