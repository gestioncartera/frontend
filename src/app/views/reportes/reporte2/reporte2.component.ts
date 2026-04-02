import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrestamoService } from '../../../services/prestamo.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { 
  CardModule, GridModule, TableModule, BadgeModule, ButtonModule
   
} from '@coreui/angular';

@Component({
  selector: 'app-reporte2',
  standalone: true,
  imports: [
    CommonModule, CardModule, GridModule, TableModule, 
    BadgeModule, ButtonModule
  ],
  templateUrl: './reporte2.component.html',
  styleUrls: ['./reporte2.component.scss']
})
export class Reporte2Component implements OnInit {
  // Datos para los cuadros superiores (KPIs)
  public resumenCartera = {
    saldoTotalCapital: 0,
    saldoIntereses:0
  };

  // Datos para la tabla detallada
  public prestamosDetalle: any[] = [];
  
  public sucursalId: number = 0;
  private cd = inject(ChangeDetectorRef);

  constructor(
    private prestamoService: PrestamoService,
    private sucursalContextService: SucursalContextService
  ) {}

  ngOnInit(): void {
    // Usamos || para asegurar que si es 0, null o undefined, tome el valor por defecto
    this.sucursalId = this.sucursalContextService.getSucursalId() || 4;
    
    if (this.sucursalId) {
      this.cargarAuditoria();
      this.cargarDesglose();
    }
  }

  cargarAuditoria() { 
    this.prestamoService.getCapitalEnCalle(this.sucursalId).subscribe({
      next: (res) => {
        this.resumenCartera = {
          ...this.resumenCartera,
          saldoTotalCapital: Number(res.capital_en_calle)
        };
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error en resumen:', err)
    });

    // 2. Cargamos el detalle de los préstamos para la tabla
    // Asumiendo que tienes un método llamado getDetallePrestamosPorSucursal
    this.prestamoService.getInteresesProyectados(this.sucursalId).subscribe({
      next: (data) => {
        this.resumenCartera = {
          ...this.resumenCartera,
          saldoIntereses: Number(data.intereses_proyectados)
        };
        console.log('Prueba intereses:', data);
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error en detalle:', err)
    });
  }

  getBadgeColor(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'al día': return 'success';
      case 'atrasado': return 'warning';
      case 'mora': return 'danger';
      case 'finalizado': return 'info';
      default: return 'secondary';
    }
  }

  cargarDesglose() {
  const id = this.sucursalId || this.sucursalContextService.getSucursalId();
  if (!id) return;

  this.prestamoService.getDesglosePrestamos(id).subscribe({
    next: (data) => {
      // Mapeamos los datos del API a los nombres de tu tabla HTML
      this.prestamosDetalle = data.map(item => ({
        id: item.prestamo_id,
        cliente: item.nombre,
        capital: Number(item.monto_prestamo),
        saldo: Number(item.saldo_pendiente),
        estado: item.estado_prestamo
      }));
      
      this.cd.detectChanges(); // Notificamos a Angular el cambio de datos
    },
    error: (err) => console.error('Error al cargar la tabla:', err)
  });
}


}