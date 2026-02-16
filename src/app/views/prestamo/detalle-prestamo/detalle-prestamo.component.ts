import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PrestamoService, Prestamos, CobroDetalle } from '../../../services/prestamo.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // <--- AGREGAR ESTO
 import { TipoPrestamo, TipoPrestamoService } from '../../../services/tipoPrestamo.service';
import { CobroService } from '../../../services/cobro.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';

@Component({
  selector: 'app-detalle-prestamo',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './detalle-prestamo.component.html',
  styleUrls: ['./detalle-prestamo.component.scss']
})
export class DetallePrestamoComponent implements OnInit {
  prestamo: Prestamos | null = null;
  prestamoId: number | null = null;
  displayedColumns: string[] = ['fecha_cobro', 'monto_cobrado', 'estado'];
  tiposPrestamo: TipoPrestamo[] = [];
  historialCobros: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private prestamoService: PrestamoService,
    private tipoPrestamoService: TipoPrestamoService,
    private location: Location,
    private cobroService: CobroService,
    private sucursalContextService: SucursalContextService,  
  ) {}

  ngOnInit(): void {
    this.cargarTiposPrestamo();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.prestamoId = +id;
        this.loadPrestamo(this.prestamoId);
        this.cargarHistorialCobros(this.prestamoId);
      }
    });
  }

  cargarHistorialCobros(prestamoId: number) {
    console.log('Cargando historial de cobros para prestamoId:', prestamoId);
    this.cobroService.gethistorialcobros(prestamoId).subscribe({
      next: (data: any) => {
        this.historialCobros = data;
        console.log('Historial de cobros cargado:', this.historialCobros);
      },
      error: (err: any) => {
        console.error('Error cargando historial de cobros', err);
      }
    });
  }
    
  cargarTiposPrestamo() {
      const idSucursal = this.sucursalContextService.getSucursalId();
    if (!idSucursal) return;
    
    this.tipoPrestamoService.getTiposPrestamo(idSucursal).subscribe(data => {
      // Normalizamos los datos para asegurar que tengan id_tipo_prestamo
      this.tiposPrestamo = data.map((t: any) => {
        if (!t.id_tipo_prestamo) {
           t.id_tipo_prestamo = t.id || t.Id || t.tipo_prestamo_id;
        }
        return t;
      });
      console.log('TiposPrestamo loaded (normalized):', this.tiposPrestamo);
    });
  }

  // Helper para comparar objetos en el select y que se preseleccione correctamente el valor
  compareTipos(t1: any, t2: any): boolean {
    return t1 && t2 ? t1 === t2 : t1 === t2;
  }

  loadPrestamo(id: number) {
    this.prestamoService.getPrestamoInfoById(id).subscribe({
      next: (data) => {
        this.prestamo = data;
        if (this.prestamo) {
          // Convertir strings numéricos a números para inputs type="number"
          this.prestamo.monto_prestamo = Number(this.prestamo.monto_prestamo);
          this.prestamo.saldo_pendiente = Number(this.prestamo.saldo_pendiente);
          this.prestamo.valor_intereses = Number(this.prestamo.valor_intereses);
          this.prestamo.valor_cuota = Number(this.prestamo.valor_cuota);

          // Convertir fechas
          if (this.prestamo.fecha_desembolso) {
            this.prestamo.fecha_desembolso = new Date(this.prestamo.fecha_desembolso);
          }
          if (this.prestamo.fecha_fin_prestamo) {
            this.prestamo.fecha_fin_prestamo = new Date(this.prestamo.fecha_fin_prestamo);
          }
        }
      },
      error: (err) => {
        console.error('Error cargando préstamo', err);
      }
    });
  }

  guardar() {
    if (this.prestamo && this.prestamoId) {
      console.log('Guardando préstamo:', this.prestamo);
      this.prestamoService.updatePrestamo(this.prestamoId, this.prestamo).subscribe({
        next: () => {
          alert('Préstamo actualizado correctamente');
          this.goBack();
        },
        error: (err) => {
          console.error('Error actualizando préstamo', err);
          alert('Error al actualizar el préstamo');
        }
      });
    }
  }
  

  goBack() {
    this.location.back();
  }

  
  limpiarCero(event: any) {
    if (this.prestamo && this.prestamo.monto_prestamo === 0) {
      this.prestamo.monto_prestamo = null as any;
    }
  }

  validarVacio() {
    if (this.prestamo && (this.prestamo.monto_prestamo === null || (this.prestamo.monto_prestamo as any) === '')) {
      this.prestamo.monto_prestamo = 0;
    }
  }
}
