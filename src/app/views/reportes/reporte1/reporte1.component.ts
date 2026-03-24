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
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { CobroService } from '../../../services/cobro.service';

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
  public resumenRutas: any[] = [];
  public cargando: boolean = false;
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

  constructor(
    private cobroService: CobroService,
    private sucursalContextService: SucursalContextService) {}

  ngOnInit(): void {
    this.cargarResumenCobros();
    this.cargarDatosKpis();
  }

  verDetalles(item: any) {
    console.log('Navegando a detalles de:', item.cobrador);
  }


cargarResumenCobros() {
  const sucursalId = this.sucursalContextService.getSucursalId();
  if (!sucursalId) return;

  this.cargando = true;

  this.cobroService.getResumenCobrosCobradorRuta(sucursalId).subscribe({
    next: (data) => {
      this.resumenRutas = data;
      this.cargando = false;
      
      // Calculamos el total recaudado sumando todos los items
      this.actualizarKpisGlobales();
    },
    error: (err) => {
      this.cargando = false;
      console.error('Error:', err);
    }
  });
}

actualizarKpisGlobales() {
  // Suma el total recaudado de todas las rutas que llegaron
  const total = this.resumenRutas.reduce((acc, curr) => acc + Number(curr.total_recaudado), 0);
  this.kpis.totalCobradoHoy = total;
  
  // Opcional: Contar total de recibos del día
  this.kpis.cobrosPendientes = this.resumenRutas.reduce((acc, curr) => acc + Number(curr.total_recibos), 0);
}

cargarDatosKpis() {
  const sucursalId = this.sucursalContextService.getSucursalId();
  if (!sucursalId) return;

  this.cobroService.getTotalCobradoHoy(sucursalId).subscribe({
    next: (res) => {
      // Actualizamos los KPIs que definiste en tu objeto
      this.kpis.totalCobradoHoy = res.total_hoy;
      this.kpis.cobrosPendientes = res.conteo_recibos; 
      console.log('KPIs actualizados:', this.kpis);
    },
    error: (err) => console.error('Error cargando KPIs:', err)
  });
}

}
