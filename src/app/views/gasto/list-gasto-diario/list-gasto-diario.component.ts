import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

// Servicios e Interfaces
import { MovimientoCajaSucursal } from '../../../services/caja-sucursal.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { CajaDiario, CajaDiarioService, EgresoOperacion } from '../../../services/caja-diario..service';

@Component({
  selector: 'app-list-gasto-diario',
  templateUrl: './list-gasto-diario.component.html',
  styleUrls: ['./list-gasto-diario.component.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, MatTableModule,
    MatPaginatorModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSortModule, MatCardModule,
    MatTooltipModule, MatDatepickerModule, MatNativeDateModule
  ],
})
export class ListGastoDiarioComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['fecha', 'tipo', 'concepto', 'valor', 'estado', 'acciones'];
  dataSource: MatTableDataSource<EgresoOperacion>;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

   
  totalCaja: number = 0; 
  fechaFiltro: Date = new Date();
  isMobile = false;
  sucursalId: number | null = null;
  movimientosData: EgresoOperacion[] = [];

  constructor(
    private router: Router, 
    private responsive: BreakpointObserver,
    private cajaDiarioService: CajaDiarioService, // Nombre consistente del servicio
    private sucursalContextService: SucursalContextService
  ) {
    this.dataSource = new MatTableDataSource<EgresoOperacion>([]);
  }

  ngOnInit(): void {
    this.sucursalId = this.sucursalContextService.getSucursalId();
    this.detectMobile();

    if (this.sucursalId) {
      this.refreshData(); 
    } else {
      Swal.fire('Atención', 'Seleccione una sucursal para continuar.', 'info');
      this.router.navigate(['/cambio-sucursal']);
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  refreshData(): void {
    this.loadBalance();
    this.loadMovimientos();
  }

  loadBalance(): void {
    if (!this.sucursalId) return;
    // Corregido: se usa this.cajaDiarioService y tipado (res: any)
    this.cajaDiarioService.getCaja(this.sucursalId).subscribe({
      next: (res: any) => this.totalCaja = res.saldo || 0,
      error: (err: any) => console.error('Error obteniendo saldo', err)
    });
  }
loadMovimientos(): void {
  // Verificamos que tengamos el ID necesario (en este caso sucursal o usuario según tu lógica de ruta)
  if (!this.sucursalId) return;
  
  // 1. Cambiamos el tipo de dato esperado a EgresoOperacionPendiente[]
  this.cajaDiarioService.getEgresosOperacionPendientes(this.sucursalId).subscribe({
    next: (data: EgresoOperacion[]) => {
      // 2. Normalizamos la fecha seleccionada para comparar (YYYY-MM-DD)
      const selectedDate = this.fechaFiltro.toLocaleDateString('en-CA');
      
      // 3. Filtramos usando los campos correctos de la nueva interfaz: 'fecha_gasto'
      this.movimientosData = data.filter((m: EgresoOperacion) => {
        if (!m.fecha_gasto) return false;
        // Comparamos solo la parte de la fecha (YYYY-MM-DD)
        return m.fecha_gasto.split('T')[0] === selectedDate;
      }); 
      // 4. Actualizamos el origen de datos de la tabla
      this.dataSource.data = this.movimientosData;
    },
    error: (err: any) => {
      console.error('Error al cargar movimientos pendientes:', err);
      Swal.fire('Error', 'No se pudieron recuperar los egresos de operación.', 'error');
    }
  });
}
  onFechaChange(): void {
    this.loadMovimientos();
  }


  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  detectMobile(): void {
    this.responsive.observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }

  eliminar(id: number): void {
  }
    
}