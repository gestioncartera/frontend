import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Provee CurrencyPipe, NgFor, etc.

import { 
  CardModule, 
  GridModule, 
  TableModule, 
  BadgeModule, 
  ButtonModule
} from '@coreui/angular';

@Component({
  selector: 'app-reporte2',
  standalone: true, // CLAVE: Permite que el componente se gestione solo
  imports: [
    CommonModule, // INDISPENSABLE: Para que funcione el pipe 'currency'
    CardModule, 
    GridModule, 
    TableModule, 
    BadgeModule, 
    ButtonModule
  ],
  templateUrl: './reporte2.component.html',
  styleUrls: ['./reporte2.component.scss']
})
export class Reporte2Component implements OnInit {

  resumenCartera = {
    saldoTotalCapital: 54200.00,
    saldoIntereses: 12400.50,
    moraTotal: 3500.00,
    prestamosActivos: 142
  };

  prestamosDetalle = [
    { id: 'P-001', cliente: 'Juan Pérez', capital: 1000, saldo: 450, estado: 'Al día', ultimaCuota: '2024-05-20' },
    { id: 'P-002', cliente: 'María López', capital: 500, saldo: 500, estado: 'Mora', ultimaCuota: '2024-04-15' },
    { id: 'P-003', cliente: 'Carlos Ruiz', capital: 2000, saldo: 1200, estado: 'Atrasado', ultimaCuota: '2024-05-02' }
  ];

  constructor() {}

  ngOnInit(): void {}

  getBadgeColor(estado: string): string {
    switch (estado) {
      case 'Al día': return 'success';
      case 'Atrasado': return 'warning';
      case 'Mora': return 'danger';
      default: return 'secondary';
    }
  }
}