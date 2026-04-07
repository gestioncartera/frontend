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
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import Swal from 'sweetalert2';
import { CajaService, MovimientoCajaSucursal } from '../../../services/caja-sucursal.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ChangeDetectorRef, inject } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-list-gasto',
  templateUrl: './list-gasto.component.html',
  styleUrls: ['./list-gasto.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatSelectModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule
  ],
})
export class ListGastoComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['fecha', 'tipo', 'concepto', 'valor', 'estado', 'acciones'];
  //dataSource: MatTableDataSource<MovimientoCajaSucursal>;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  movimientosData: MovimientoCajaSucursal[] = [];
  totalCaja: number = 0;
  isMobile = false;
  private cd = inject(ChangeDetectorRef);
  sucursalId: number | null = null;
  fechaFiltro: Date = new Date();
  dataSource = new MatTableDataSource<MovimientoCajaSucursal>([]);
  fechaInicio: Date = new Date();
  fechaFin: Date = new Date();

  constructor(
    private router: Router, 
    private responsive: BreakpointObserver,
    private cajaService: CajaService,
    private sucursalContextService: SucursalContextService,
    private dialog: MatDialog
  ) {
     
  }

 ngOnInit(): void {
  this.sucursalId = this.sucursalContextService.getSucursalId();
  this.detectMobile();

  // 1. Si NO hay sucursal, bloqueamos y redirigimos
  if (!this.sucursalId) {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Advertencia',
        message: 'No ha seleccionado una sucursal activa.',
        confirmText: 'Ir a Selección',
        type: 'warning',
        icon: 'storefront',
        color: 'primary'
      }
    }).afterClosed().subscribe(() => {
      this.router.navigate(['/cambio-sucursal']);
    });
    return; // Salimos de la función
  }

  // 2. Si llegamos aquí, la sucursal existe. Cargamos todo.
  this.setupFilter();
  this.cargarDatosPorRango();
}

// Extraer el diálogo a un método privado hace que el ngOnInit sea más fácil de leer
private mostrarAdvertenciaSucursal(): void {
  this.dialog.open(ConfirmDialogComponent, {
    width: '400px',
    data: {
      title: 'Advertencia',
      message: 'No ha seleccionado una sucursal activa.',
      confirmText: 'Ir a Selección',
      cancelText: '', 
      type: 'warning',
      icon: 'storefront',
      color: 'primary'
    }
  }).afterClosed().subscribe(() => {
    this.router.navigate(['/cambio-sucursal']);
  });
}
  onFechaChange(): void {
  if (this.fechaInicio && this.fechaFin) {
    this.cargarDatosPorRango();
  }
}

 cargarDatosPorRango(): void {
    this.loadMovimientos();
    this.loadBalance();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

loadMovimientos(): void {
  // Verificamos que tengamos la sucursal y ambas fechas
  if (!this.sucursalId || !this.fechaInicio || !this.fechaFin) return;

 const fInicio = this.fechaInicio.toLocaleDateString('en-CA');  
 const fFin = this.fechaFin.toLocaleDateString('en-CA');

  // Enviamos los tres parámetros al servicio
  this.cajaService.getMovimientos(this.sucursalId, fInicio, fFin).subscribe({
    next: (data) => {
      this.movimientosData = data;
      this.dataSource.data = data;

      // Sincronizamos los complementos de la tabla
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filter = ''; 
        this.cd.detectChanges();
      });

      console.log(`Movimientos cargados  `,data);
    },
    error: (err) => {
      console.error('Error al cargar movimientos por rango:', err);
    }
  });
}
 
  loadBalance(): void {
    if (!this.sucursalId) return;
    this.cajaService.getCajaSucursal(this.sucursalId ).subscribe({
      next: (balance) => {
        setTimeout(() => {
          this.totalCaja = Number(balance?.saldo_actual) || 0;
          console.log('Balance de caja cargado:', this.totalCaja);
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error al cargar el balance', err);
      }
    });
  }
    

setupFilter(): void {
  this.dataSource.filterPredicate = (data: MovimientoCajaSucursal, filter: string) => {
    // Si no hay filtro, mostrar todo
    if (!filter) return true;
    const searchStr = (data.descripcion || '').toLowerCase();
    const conceptoStr = (data.descripcion || '').toLowerCase(); // Opcional: buscar también por concepto
    
    return searchStr.includes(filter) || conceptoStr.includes(filter);
  };
}

  detectMobile(): void {
    this.responsive.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile = result.matches;
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  delete = async (item: MovimientoCajaSucursal): Promise<void> => {
   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: '¿Eliminar registro?',
        message: `¿Está seguro de eliminar el movimiento: <b>${item.descripcion}</b>? Esta acción afectará el saldo actual de caja.`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
        type: 'error',
        icon: 'delete_forever',
        color: 'warn'
      }
    });

   dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cajaService.deleteMovimiento(item.movimiento_id).subscribe({
          next: () => {
            // Alerta de éxito (opcional, podrías usar un SnackBar aquí para que sea menos intrusivo)
            this.dialog.open(ConfirmDialogComponent, {
              width: '350px',
              data: {
                title: 'Eliminado',
                message: 'El registro ha sido removido exitosamente.',
                confirmText: 'Aceptar',
                cancelText: '',
                type: 'success',
                icon: 'check_circle',
                color: 'primary'
              }
            });
            this.loadMovimientos();
            this.loadBalance();
          },
          error: (err) => {
            const errorMessage = err.error?.message || err.error?.error || 'No se pudo completar la eliminación del registro.';
            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Error',
                message: errorMessage,
                confirmText: 'Entendido',
                type: 'error',
                icon: 'error',
                color: 'warn'
              }
            });
          }
        });
      }
    });
  };

  
  
 
}