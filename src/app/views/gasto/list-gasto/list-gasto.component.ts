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
    MatDialogModule
  ],
})
export class ListGastoComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['fecha', 'tipo', 'concepto', 'valor', 'estado', 'acciones'];
  dataSource: MatTableDataSource<MovimientoCajaSucursal>;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  movimientosData: MovimientoCajaSucursal[] = [];
  totalCaja: number = 0;
  isMobile = false;

  sucursalId: number | null = null;

  constructor(
    private router: Router, 
    private responsive: BreakpointObserver,
    private cajaService: CajaService,
    private sucursalContextService: SucursalContextService,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource(this.movimientosData);
  }

  ngOnInit(): void {
    this.sucursalId = this.sucursalContextService.getSucursalId();
    this.detectMobile();

    if (this.sucursalId) {
      this.loadMovimientos();
      this.loadBalance();
      this.setupFilter();
    } else {
     this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Advertencia',
          message: 'No ha seleccionado una sucursal activa.',
          confirmText: 'Ir a Selección',
          cancelText: '', // Solo un botón para forzar la navegación
          type: 'warning',
          icon: 'storefront',
          color: 'primary'
        }
      }).afterClosed().subscribe(() => {
        this.router.navigate(['/cambio-sucursal']);
      });
    
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadMovimientos(): void {
    if (!this.sucursalId) return;
    this.cajaService.getMovimientos(this.sucursalId).subscribe({
      next: (data) => {
        this.movimientosData = data;
        this.dataSource.data = data;
        console.log('Movimientos cargados:', data);
      },
      error: (err) => {
        console.error('Error al cargar movimientos', err);
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Error de Carga',
            message: 'No se pudieron recuperar los movimientos de caja.',
            confirmText: 'Reintentar',
            type: 'error',
            icon: 'cloud_off',
            color: 'warn'
          }
        });
      }
    });
  }
 
  loadBalance(): void {
    if (!this.sucursalId) return;
    this.cajaService.getCajaSucursal(this.sucursalId).subscribe({
      next: (balance) => {
        this.totalCaja = Number(balance?.saldo_actual) || 0;
        console.log('Balance de caja cargado:', this.totalCaja);
      },
      error: (err) => {
        console.error('Error al cargar el balance', err);
      }
    });
  }
    

  setupFilter(): void {
    // Personalización del filtrado para buscar en descripción
    this.dataSource.filterPredicate = (data: MovimientoCajaSucursal, filter: string) => {
      const searchStr = data.descripcion.toLowerCase();
      return searchStr.includes(filter);
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
            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Error',
                message: 'No se pudo completar la eliminación del registro.',
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