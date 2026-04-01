import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

export interface CajaMayorData {
  caja_inicial: number;
  caja_actual: number;
  entradas: {
    cobros: number;
    cheques_cobrados: number;
    aportes: number;
    liquido_a_depositar: number;
  };
  salidas: {
    gastos: number;
    deposito_a_banco: number;
    prestamos: number;
    reembolso_a_socios: number;
    base_diaria: number;
  };
  metricas_adicionales: {
    cuentas_por_cobrar: number;
    rendimiento: number;
    fecha: string;
  };
}

@Component({
  selector: 'app-caja-mayor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './caja-mayor.component.html',
  styleUrls: ['./caja-mayor.component.scss']
})
export class CajaMayorComponent implements OnInit {

  sucursales = [
    { id: 1, nombre: 'SUCURSAL MEX' },
    { id: 2, nombre: 'SUCURSAL COL' }
  ];
  
  sucursalSeleccionada: number = 1;
  isLoading: boolean = false;

  // Datos basados en tu captura de pantalla
  datosCaja: CajaMayorData = {
    caja_inicial: 2373,
    caja_actual: 259393,
    entradas: {
      cobros: 10866086,
      cheques_cobrados: 0,
      aportes: 44000,
      liquido_a_depositar: 26411025
    },
    salidas: {
      gastos: 609975,
      deposito_a_banco: 0,
      prestamos: 9654160,
      reembolso_a_socios: 0,
      base_diaria: 26198005
    },
    metricas_adicionales: {
      cuentas_por_cobrar: 948115,
      rendimiento: 1448124,
      fecha: 'Viernes [ 5.Sep.2025 ]'
    }
  };

  constructor() { }

  ngOnInit(): void {
    this.cargarDatosCaja();
  }

  cargarDatosCaja(): void {
    // Aquí harías la petición a tu backend pasándole this.sucursalSeleccionada
    console.log('Cargando datos para sucursal:', this.sucursalSeleccionada);
  }

  verHistorial(): void {
    console.log('Abriendo historial...');
  }
}