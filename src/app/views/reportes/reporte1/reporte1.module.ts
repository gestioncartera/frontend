import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reporte1Component } from './reporte1.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [Reporte1Component],
  imports: [CommonModule, RouterModule],
  exports: [Reporte1Component]
})
export class Reporte1Module {}
