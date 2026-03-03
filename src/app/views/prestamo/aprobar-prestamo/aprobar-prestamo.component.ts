import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { PrestamoService } from '../../../services/prestamo.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-aprobar-prestamo',
  standalone: true,
  templateUrl: './aprobar-prestamo.component.html',
  styleUrls: ['./aprobar-prestamo.component.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
 
  ],
})
export class AprobarPrestamoComponent implements OnInit {
  
  displayedColumns: string[] = ['ID', 'cliente', 'cobrador','interes', 'monto', 'saldo', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  loading: boolean = false;
  sucursalId: number = 1; // Debería venir de tu sistema de login o ruta
  isMobile: boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private prestamoService: PrestamoService,
     private responsive: BreakpointObserver) {}

  ngOnInit(): void {
    this.loadPrestamos();
    this.detectMobile();
  }

  loadPrestamos() {
    this.loading = true;
    this.prestamoService.getPrestamosPendientesBySucursal(this.sucursalId).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
        console.log('Préstamos pendientes cargados:', data);
      },
      error: (err) => {
        console.error('Error al cargar préstamos:', err);
        this.loading = false;
      }
    });
  }

  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

    detectMobile() {
    this.responsive.observe([Breakpoints.Handset, Breakpoints.TabletPortrait]).subscribe((result) => {
      this.isMobile = result.matches;
      // Esto asegura que al volver a Desktop, el paginador se reconecte
      if (!this.isMobile) {
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
        }, 0);
      }
    });
  }

  confirmarAprobacion(prestamo: any) {
  Swal.fire({
    title: '¿Confirmar Préstamo?',
    text: `Vas a aprobar el préstamo de ${prestamo.prestamo_id}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#1e3a8a', // Azul institucional
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Sí, confirmar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  }).then((result) => {
    console.log('Resultado de la confirmación:', prestamo);
    if (result.isConfirmed) {
      this.loading = true;
      
      this.prestamoService.confirmarPrestamo(prestamo.prestamo_id).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: '¡Confirmado!',
            text: res.message || 'El préstamo ha sido aprobado correctamente.',
            timer: 1500,
            showConfirmButton: false
          });
          this.loadPrestamos(); // Recargar la lista para que desaparezca o cambie de estado
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo confirmar el préstamo.', 'error');
          this.loading = false;
        }
      });
    }
  });
}
}