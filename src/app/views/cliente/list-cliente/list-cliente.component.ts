import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip'; // Importante para el diseño moderno
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ClienteService, Cliente } from '../../../services/cliente.service';
import { Location } from '@angular/common';
import { SucursalContextService } from '../../../services/sucursal-context.service';

@Component({
  selector: 'app-list-cliente',
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
    MatSelectModule,
    MatTooltipModule,
    MatDividerModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './list-cliente.component.html',
  styleUrls: ['./list-cliente.component.scss'],
})
export class ListClienteComponent implements OnInit {
  // Columnas base
  displayedColumns: string[] = ['nombre', 'telefono', 'ruta', 'estado', 'actions'];
  dataSource = new MatTableDataSource<Cliente>([]);
  allClientes: Cliente[] = [];
  rutaFilter = new FormControl('');
  rutas: string[] = [];
  mode: string = 'normal'; 
  isMobile = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private location: Location,
    private responsive: BreakpointObserver, 
    private router: Router,
    private clienteService: ClienteService,
    private route: ActivatedRoute,
    private sucursalContextService: SucursalContextService
  ) {}

  ngOnInit(): void {
    // 1. Detectar modo y ajustar columnas
    this.route.data.subscribe(data => {
      this.mode = data['mode'] || 'normal';
      if (this.mode === 'selectForLoan') {
        // En modo selección simplificamos la tabla
        this.displayedColumns = ['nombre', 'telefono', 'ruta', 'actions'];
      }
      this.loadClientes();
    });
    
    this.detectMobile();
    this.setupRutaFilter();
  }

  detectMobile() {
    this.responsive.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile = result.matches;
      // Reasignar paginador con un pequeño delay para asegurar que la vista cargó
      setTimeout(() => {
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      });
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  setupRutaFilter() {
    this.rutaFilter.valueChanges.subscribe((rutaId) => {
      if (!rutaId) {
        this.dataSource.data = this.allClientes;
      } else {
        this.dataSource.data = this.allClientes.filter(
          (c) => c.nombre_ruta ===  (rutaId)
        );
      }
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    });
  }

  loadClientes() {
    const idSucursal = this.sucursalContextService.getSucursalId();
    if (!idSucursal) return;

    // Seleccionamos el observable según el modo
    const request$ = this.mode === 'selectForLoan'
      ? this.clienteService.getClientesPrestamo(idSucursal)
      : this.clienteService.getClientes(idSucursal);

    request$.subscribe({
      next: (data) => {
        this.allClientes = data;
        this.dataSource.data = data;
        this.rutas = [...new Set(this.allClientes.map(c => c.nombre_ruta))].sort((a, b) => a.localeCompare(b));
        this.dataSource.paginator = this.paginator;
        console.log('Clientes cargados:', data);
      },
      error: (err) => console.error('Error al cargar clientes', err)
    });
  }

  // --- MÉTODOS DE NAVEGACIÓN ---

 // Función para Seleccionar o Ver detalles
verPrestamosCliente(row: Cliente) {
  if (this.mode === 'selectForLoan') {
    /** * MÓDULO PRÉSTAMOS: **/
     
    this.router.navigate(['/prestamo/list-prestamo'], {
      queryParams: { 
        cliente_id: row.cliente_id        
      }
    }  );
  } 
}

  deleteCliente(row: Cliente) {
    // Aquí podrías disparar un MatDialog para que el confirm sea más estético
    if (confirm(`¿Estás seguro de eliminar a ${row.nombres}?`)) {
      console.log('Eliminando...', row.cliente_id);
      // Lógica de borrado aquí
    }
  }
  /*
  goBack() {
  if (this.mode === 'selectForLoan') {
    // Si venía de crear un préstamo, regresa allá
    this.router.navigate(['/prestamo/crear-prestamo']);
  } else {
    // Si es gestión normal, regresa a la página anterior (ej. Dashboard)
    this.location.back();
  }
}*/
}