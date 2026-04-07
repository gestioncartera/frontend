import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  CardModule, 
  GridModule, 
  TableModule, 
  ButtonModule, 
  FormModule,
  BadgeModule 
} from '@coreui/angular';
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { CobroService } from '../../../services/cobro.service';
import { PrestamoService } from '../../../services/prestamo.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { forkJoin, delay, finalize } from 'rxjs';

@Component({
  selector: 'app-reporte1',
  templateUrl: './reporte1.component.html',
  styleUrls: ['./reporte1.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CardModule, 
    GridModule, 
    TableModule, 
    ButtonModule, 
    FormModule,
    BadgeModule,
    MatIconModule, 
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
  ], 
})
export class Reporte1Component implements OnInit {
  // Variables de Estado
  public resumenRutas: any[] = [];
  public cargando: boolean = false;
  public fechaSeleccionada: Date = new Date(); 
  public sucursalId: number = 0;
  
  // KPIs del reporte
  public kpis = {
    total_cobro_hoy: 0,
    carteraTotal: 0  
  };

  private cd = inject(ChangeDetectorRef);

  constructor(
    private cobroService: CobroService,
    private prestamoService: PrestamoService,
    private sucursalContextService: SucursalContextService
  ) {}

  ngOnInit(): void { 
    this.sucursalId = this.sucursalContextService.getSucursalId() || 0;  
    if (this.sucursalId) {
      this.cargarTodo();
    }
  }

  /**
   * Se ejecuta al cambiar la fecha en el MatDatepicker
   */
  onFechaChange(): void {
    this.cargarTodo();
  }

  /**
   * Orquestador centralizado para evitar bloqueos en el indicador de carga
   */
  cargarTodo(): void {
    if (!this.sucursalId) return;

    // Formato YYYY-MM-DD para el backend
    const fechaFmt = this.fechaSeleccionada.toLocaleDateString('en-CA');
    
    this.cargando = true;
    this.cd.detectChanges();

    // forkJoin ejecuta las peticiones en paralelo
    forkJoin({
      resumen: this.cobroService.getResumenCobrosCobradorRuta(this.sucursalId, fechaFmt),
      kpiHoy: this.cobroService.getTotalCobradoHoy(this.sucursalId, fechaFmt),
      cartera: this.prestamoService.getTotalCarteraSucursal(this.sucursalId)
    })
    .pipe(
      delay(0),
      // finalize asegura que cargando sea false tanto en éxito como en error
      finalize(() => {
        this.cargando = false;
        this.cd.detectChanges();
      })
    )
    .subscribe({
      next: (res) => {
        // 1. Datos de la tabla (ajustado a 'total_cobrado' según tu Postman)
        this.resumenRutas = res.resumen || [];

        // 2. KPI Recaudación
        this.kpis.total_cobro_hoy = res.kpiHoy?.total_cobro_hoy 
          ? Number(res.kpiHoy.total_cobro_hoy) 
          : 0;

        // 3. KPI Cartera Total
        this.kpis.carteraTotal = res.cartera?.total_cartera 
          ? Number(res.cartera.total_cartera) 
          : 0;
      },
      error: (err) => {
        console.error('Error en la carga masiva del reporte:', err);
        // Opcional: resetear datos para no mostrar información vieja
        this.resumenRutas = [];
      }
    });
  }

  verDetalles(item: any): void {
    console.log('Ruta:', item.nombre_ruta, 'Cobrador:', item.nombre_cobrador);
  }
}