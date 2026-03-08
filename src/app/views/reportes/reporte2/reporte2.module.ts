import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reporte2Component } from './reporte2.component';
import { RouterModule } from '@angular/router';
import { CardModule, GridModule, TableModule, BadgeModule, ButtonModule } from '@coreui/angular';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [Reporte2Component],
  imports: [CommonModule, FormsModule, RouterModule, CardModule, GridModule, TableModule, BadgeModule, ButtonModule],
  providers: [CurrencyPipe],
  exports: [Reporte2Component]
})
export class Reporte2Module {}
