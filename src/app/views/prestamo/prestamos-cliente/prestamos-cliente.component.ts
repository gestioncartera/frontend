import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PrestamoService } from '../../../services/prestamo.service';

@Component({
  selector: 'app-prestamos-cliente',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterModule,
  ],
  templateUrl: './prestamos-cliente.component.html',
  styleUrls: ['./prestamos-cliente.component.scss'],
})
export class PrestamosClienteComponent implements OnInit {
  cliente_id!: number;
  nombre_cliente: string = '';
  displayedColumns: string[] = ['prestamo_id', 'saldo_pendiente', 'valor_cuota', 'fecha_fin_prestamo', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isMobile = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private responsive: BreakpointObserver,
    private router: Router,
    private route: ActivatedRoute,
    private prestamoService: PrestamoService
  ) {}

  ngOnInit(): void {
    // Leer cliente_id desde route params
    this.route.params.subscribe(params => {
      if (params['cliente_id']) {
        this.cliente_id = +params['cliente_id'];
      }
      if (params['nombre_cliente']) {
        this.nombre_cliente = params['nombre_cliente'];
      }
      if (this.cliente_id) {
        this.loadPrestamos();
      }
    });

    this.detectMobile();
  }

  detectMobile() {
    this.responsive.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile = result.matches;
      if (!this.isMobile) {
        setTimeout(() => (this.dataSource.paginator = this.paginator));
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadPrestamos() {
    this.prestamoService. getPrestamosByCliente(this.cliente_id).subscribe({
      next: (data: any) => {
        this.dataSource.data = data;
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        });
      },
      error: (err: any) => {
        console.error('Error al cargar préstamos del cliente:', err);
        this.dataSource.data = [];
      }
    });
  }

  
  verDetalles(row: any) {
    // Navegar a tarjeta component con el ID del préstamo
    const prestamoId = this.cliente_id ? row.prestamo_id : row.id;
    this.router.navigate(['/tarjeta'], {
      queryParams: { prestamoId: prestamoId }
    });
  }

  volverAClientes() {
    this.router.navigate(['cobro/crear-cobro']);
  }
}
