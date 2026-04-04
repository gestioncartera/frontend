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
import { delay } from 'rxjs/operators'; // Importante para la solución
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
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
  public resumenRutas: any[] = [];
  public cargando: boolean = false;
  fechaSeleccionada: Date = new Date(); 
  private cd = inject(ChangeDetectorRef);
  sucursalId: number = 0;
  kpis = {
    total_cobro_hoy: 0,
    carteraTotal: 0  
  };

  constructor(
    private cobroService: CobroService ,
    private  prestamos:PrestamoService,
    private sucursalContextService: SucursalContextService
  ) {}

  ngOnInit(): void { 
  this.sucursalId = this.sucursalContextService.getSucursalId() || 0;  
    if (this.sucursalId) {
      this.cargarResumenCobros();
      this.cargarDatosKpis();  
      this.cargarTotal();
    }
  }
  verDetalles(item: any) {
    console.log('Navegando a detalles de:', item.cobrador);
  }

  cargarResumenCobros() {
    const sucursalId = this.sucursalContextService.getSucursalId();
    if (!sucursalId) return;
   const fechaFmt = this.fechaSeleccionada.toISOString().split('T')[0];
    this.cargando = true;  
    // Forzamos que Angular registre el estado 'true' antes de la petición
    this.cd.detectChanges();

    this.cobroService.getResumenCobrosCobradorRuta(sucursalId )
      .pipe(delay(0)) // El truco para evitar el error NG0100
      .subscribe({
        next: (data) => {
          this.resumenRutas = data;
          this.cargando = false;
          this.actualizarKpisGlobales(); 
          this.cd.detectChanges(); // Notificamos el cambio a la vista
        },
        error: (err) => {
          this.cargando = false;
          this.cd.detectChanges();
          console.error('Error:', err);
        }
      });
  }

  actualizarKpisGlobales() {
    const total = this.resumenRutas.reduce((acc, curr) => acc + Number(curr.total_recaudado), 0);
    this.kpis.total_cobro_hoy = total;
    // No es estrictamente necesario otro detectChanges aquí si se llama dentro de un subscribe con cd
  }

  cargarDatosKpis() {
     this.cobroService.getTotalCobradoHoy(this.sucursalId)
      .pipe(delay(0)) // Evitamos colisión de cambios en el objeto kpis
      .subscribe({
        next: (res) => {
          const totalRecuperado = Number(res.total_cobro_hoy);
          this.kpis = {
            ...this.kpis,
            total_cobro_hoy: totalRecuperado
          };
          this.cd.detectChanges();
        },
        error: (err) => console.error('Error cargando KPIs:', err)
      });
  }

  cargarTotal() {
       this.prestamos.getTotalCarteraSucursal(this.sucursalId)
      .pipe(delay(0)) // Evitamos colisión de cambios en el objeto kpis
      .subscribe({
        next: (res) => {
          const totalRecuperado = Number(res. total_cartera);
          this.kpis = {
            ...this.kpis,
            carteraTotal: totalRecuperado
          };
          this.cd.detectChanges();
          console.log('prueba cartera',totalRecuperado)
        },
        error: (err) => console.error('Error cargando KPIs:', err)
      });
  }

}