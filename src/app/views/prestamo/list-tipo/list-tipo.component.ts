import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Router } from '@angular/router';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TipoPrestamo, TipoPrestamoService } from '../../../services/tipoPrestamo.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';
import { SucursalContextService } from '../../../services/sucursal-context.service';

@Component({
  selector: 'app-list-tipo',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    RouterModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './list-tipo.component.html',
  styleUrls: ['./list-tipo.component.scss']
})
export class ListTipoComponent implements OnInit {
  displayedColumns: string[] = ['nombre', 'frecuencia', 'cuotas', 'porcentaje', 'actions'];
  dataSource = new MatTableDataSource<TipoPrestamo>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private tipoPrestamoService: TipoPrestamoService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sucursalContextService: SucursalContextService,
  ) {}

  ngOnInit(): void {
    this.cargarTipos();
  }

  cargarTipos() {
    const idSucursal = this.sucursalContextService.getSucursalId();
    console.log('ID de Sucursal actual:', idSucursal); // Depuración
    if (idSucursal !== null) {
    this.tipoPrestamoService.getTiposPrestamo(idSucursal).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => console.error('Error cargando tipos de préstamo', err)
    });
  } else {
    console.warn('No se puede cargar: No hay sucursal seleccionada');
    this.dataSource.data = []; // Limpiamos la tabla si no hay sucursal
  }
  }

  eliminarTipo(id: number) {
    const dialogData: ConfirmDialogData = {
      title: 'Eliminar Tipo de Préstamo',
      message: '¿Estás seguro de eliminar este tipo de préstamo? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      color: 'warn',
      type: 'error'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tipoPrestamoService.deleteTipoPrestamo(id).subscribe({
          next: () => {
            this.snackBar.open('Tipo de préstamo eliminado exitosamente', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
            this.cargarTipos();
          },
          error: (err) => {
            console.error('Error al eliminar', err);
            this.snackBar.open('Error al eliminar tipo de préstamo', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  verDetalles(row: any) {
    if (row.id_tipo_prestamo != null && !isNaN(row.id_tipo_prestamo)) {
      console.log('Navegando a tipo-prestamo con id:', row.id_tipo_prestamo);
      this.router.navigate(['/prestamo/tipo-prestamo', row.id_tipo_prestamo]);
    } else {
      console.warn('ID de tipo de préstamo inválido:', row.id_tipo_prestamo);
      this.snackBar.open('ID de tipo de préstamo inválido.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    }
  }
}
