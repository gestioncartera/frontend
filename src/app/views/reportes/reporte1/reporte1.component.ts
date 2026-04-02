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
import { delay } from 'rxjs/operators'; // Importante para la solución

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
    BadgeModule
  ], 
})
export class Reporte1Component implements OnInit {
  public resumenRutas: any[] = [];
  public cargando: boolean = false;
  
  // Inyectamos el ChangeDetectorRef para solucionar el error NG0100
  private cd = inject(ChangeDetectorRef);

  kpis = {
    total_cobro_hoy: 0,
    carteraTotal: 0  
  };

  constructor(
    private cobroService: CobroService,
    private sucursalContextService: SucursalContextService
  ) {}

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
    // Forzamos que Angular registre el estado 'true' antes de la petición
    this.cd.detectChanges();

    this.cobroService.getResumenCobrosCobradorRuta(sucursalId)
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
    // Nota: Aquí usas un ID estático 4, asegúrate de que sea intencional
    const sucursalId = 4;  
    if (!sucursalId) return;

    this.cobroService.getTotalCobradoHoy(sucursalId)
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
}