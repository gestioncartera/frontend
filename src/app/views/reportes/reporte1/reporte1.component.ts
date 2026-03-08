import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  CardModule, 
  GridModule, 
  TableModule, 
  ButtonModule, 
  FormModule,
  BadgeModule 
} from '@coreui/angular'; // Usando los módulos de CoreUI que ya tienes

@Component({
  selector: 'app-reporte1',
  templateUrl: './reporte1.component.html',
  styleUrls: ['./reporte1.component.scss'],
  imports: [
    CommonModule, 
    FormsModule, 
    CardModule, 
    GridModule, 
    TableModule, 
    ButtonModule, 
    FormModule,
    BadgeModule
  ], 
})
 
export class Reporte1Component implements OnInit {
  
  // Datos simulados basados en la imagen
  kpis = {
    totalCobradoHoy: 1450.00,
    carteraTotal: 285400.00,
    cobrosPendientes: 45,
    eficienciaRuta: 94
  };

  listaResumen = [
    { cobrador: 'Juan Pérez', ruta: 'Ruta 01 - Centro', clientes: 85, cobrados: 81, porcentaje: 95, total: 745.00 },
    { cobrador: 'María Gómez', ruta: 'Ruta 02 - Norte', clientes: 78, cobrados: 72, porcentaje: 92, total: 410.00 },
    { cobrador: 'Luis Rodríguez', ruta: 'Ruta 03 - Sur', clientes: 64, cobrados: 60, porcentaje: 94, total: 295.00 }
  ];

  constructor() {}

  ngOnInit(): void {
    // Aquí llamarías a tus servicios de Node.js para cargar datos reales
  }

  verDetalles(item: any) {
    console.log('Navegando a detalles de:', item.cobrador);
  }

}
