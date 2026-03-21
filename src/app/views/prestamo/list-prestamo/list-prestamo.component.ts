import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PrestamoService, PrestamoCliente } from '../../../services/prestamo.service';
import { ClienteService, Cliente } from '../../../services/cliente.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';

export interface Prestamo {
  id: number;
  cliente: any;
  periodo: any;
  valor: number;
  fecha: string;
  estado: string;
  saldoPendiente: number;
}

@Component({
  selector: 'app-list-prestamo',
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
  templateUrl: './list-prestamo.component.html',
  styleUrls: ['./list-prestamo.component.scss'],
})
export class ListPrestamoComponent implements OnInit {
displayedColumns: string[]  = ['prestamo_id', 'saldo_pendiente', 'valor_cuota', 'fecha_fin_prestamo', 'actions']; 
  //displayedColumns: string[] = ['cliente', 'periodo', 'valor', 'fecha', 'saldoPendiente', 'estado', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  @Input() cliente_id!: number;
  clienteNombre: string = '';
  isMobile = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private responsive: BreakpointObserver, 
    private router: Router,
    private route: ActivatedRoute,
    private prestamoService: PrestamoService,
    private clienteService: ClienteService,
    private location: Location,
    private sucursalContextService: SucursalContextService
  ) {}

  ngOnInit(): void {
    this.detectMobile();
    this.route.queryParams.subscribe(params => {
      if (params['cliente_id']) {
        this.cliente_id = Number(params['cliente_id']);
      }
      this.loadData();
    });
  }

  goBack() {
    this.location.back();
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadData() {
    if (this.cliente_id) {
      // Cargar info del cliente para mostrar el nombre
      this.clienteService.getCliente(this.cliente_id).subscribe({
        next: (cliente) => {
          this.clienteNombre = `${cliente.nombres} ${cliente.apellidos}`;
        },
        error: (err) => console.error('Error al obtener cliente:', err)
      });

      // Cargar préstamos del cliente desde la API
      this.prestamoService.getPrestamosByCliente(this.cliente_id).subscribe({
        next: (prestamos) => {
          this.dataSource.data = prestamos;
          // Columnas específicas para la vista de préstamos de un cliente
         
          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
          }
        },
        error: (error) => {
          console.error('Error al cargar préstamos del cliente:', error);
        }
      });
    } else {
      const idSucursal = this.sucursalContextService.getSucursalId();
    if (!idSucursal) return;
      // Cargar lista de clientes
      this.clienteService.getClientes(idSucursal).subscribe({
          next: (clientes) => {
            this.dataSource.data = clientes;
            // Columnas para mostrar clientes
            this.displayedColumns = ['nombres', 'apellidos', 'numero_identificacion', 'telefono', 'actions'];
            if (this.dataSource.paginator) {
              this.dataSource.paginator.firstPage();
            }
          },
          error: (error) => {
            console.error('Error al cargar clientes:', error);
          }
      });
    }
  }

  newPrestamo() {
    this.router.navigate(['/prestamo/crear-prestamo']);
  }
  // Función para calcular días restantes
obtenerDiasRestantes(fechaCorte: any): number | null {
  if (!fechaCorte) return null;
  
  const hoy = new Date();
  const fin = new Date(fechaCorte);
  
  // Normalizar fechas a medianoche
  hoy.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);

  const diffTime = fin.getTime() - hoy.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Función auxiliar para el estilo visual
getColorVencimiento(dias: number | null): string {
  if (dias === null) return 'text-muted';
  if (dias < 0) return 'text-danger fw-bold'; // Vencido
  if (dias <= 3) return 'text-warning fw-bold'; // Por vencer (3 días o menos)
  return 'text-success'; // Al día
}

  verDetalles(row: any) {
    if (this.cliente_id) {
       // Estamos viendo préstamos, ir a detalle de préstamo
       this.router.navigate(['/prestamo/detalle-prestamo', row.prestamo_id]);
    } else {
       // Estamos viendo clientes, ir a ver los préstamos de este cliente
       // Esto recargará este mismo componente pero con el cliente_id set
       // Sin embargo, este componente se usa generalmente embebido o routeado.
       // Si es routeado, deberíamos navegar a la ruta prestamos-cliente/:id
       this.router.navigate(['/prestamo/prestamos-cliente', row.cliente_id]);
    }
  }
}