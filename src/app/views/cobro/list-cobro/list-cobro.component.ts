import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

// Angular Material Imports
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

// Plugins y Servicios
import Swal from 'sweetalert2';
import { RutasService } from '../../../services/rutas.service';
import { AuthMockService } from '../../../services/AuthMockService';
import { CobroService, Cobro } from '../../../services/cobro.service';
import { isDataSource } from '@angular/cdk/collections';

@Component({
  selector: 'app-list-cobro',
  templateUrl: './list-cobro.component.html',
  styleUrls: ['./list-cobro.component.scss'],
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
    MatCardModule
  ],
})
export class ListCobroComponent implements OnInit {
  // Configuración de la Tabla
  displayedColumns: string[] = ['idprestamo', 'nombrecliente', 'fecha_cobro', 'monto_cobrado', 'estado', 'acciones'];
  dataSource: MatTableDataSource<any>;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Estados y Variables de Ruta
  cobroData: any[] = [];
  nombreCobrador: string = '';
  nombreRuta: string = '';
  rutaId: string | null = null;
  
  // Flags de Control
  isMobile = false;
  isCobrosPorRuta = false;
  canDelete = true;
  loading = false; // Para manejar el estado de las peticiones

  // Totales (Declarados pero no implementados aún según tu solicitud)
  totalRecaudadoDia: number = 0;
  totalGastosDia: number = 0;

  constructor(
    private router: Router,
    private responsive: BreakpointObserver,
    private route: ActivatedRoute,
    private rutasService: RutasService,
    private auth: AuthMockService,
    private cobroService: CobroService,
    private location: Location
  ) {
    this.dataSource = new MatTableDataSource<any>([]);
  }

  ngOnInit(): void {
    this.detectMobile();

    this.route.paramMap.subscribe(params => {
      this.rutaId = params.get('rutaId');
      this.isCobrosPorRuta = !!this.rutaId;

      // Restricción para cobradores
      this.canDelete = !(this.isCobrosPorRuta && this.auth.getRol() === 2);

      if (this.isCobrosPorRuta && this.rutaId) {
        this.obtenerNombreRuta(this.rutaId);
      }
      this.loadCobros();
    });
  }

  // CARGA DE DATOS
  loadCobros() {
    this.loading = true;
    const request = (this.isCobrosPorRuta && this.rutaId)
      ? this.cobroService.getCobrosByRutaId(this.rutaId)
      : this.cobroService.getCobros();

    request.subscribe({
      next: (data) => {
        this.cobroData = data.map(cobro => ({
          ...cobro,
          idprestamo: cobro.prestamo_id,
          nombrecliente: cobro.cliente_nombre || cobro.nombrecliente
        }));
        
        this.dataSource.data = this.cobroData;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar cobros:', err);
        this.loading = false;
      }
    });
  }

  obtenerNombreRuta(id: string) {
    this.rutasService.findRuta(id).subscribe({
      next: (ruta) => {
        if (ruta) {
          this.nombreRuta = ruta.nombre_ruta;
          this.nombreCobrador = ruta.nombre_cobrador || ruta.cobrador || 'Sin asignar';
        }
      },
      error: (err) => console.error('Error al obtener ruta:', err)
    });
  }

  // ACCIÓN MASIVA: APROBAR TODO (MÉTODO PATCH)
  aprobarTodosLosCobros() {
    // Filtrar cobros que NO están pagados
    const pendientes = this.dataSource.data.filter(
      item => item.estado?.toLowerCase() !== 'pagado'
    );

    if (pendientes.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Información',
        text: 'No hay cobros pendientes por aprobar.',
        confirmButtonColor: '#1e293b'
      });
      return;
    }

    const ids = pendientes.map(item => item.cobro_id);
    // --- IMPRESIÓN DE DEPURACIÓN ---
  console.log('Array de IDs:', ids);
  // -------------------------------

    Swal.fire({
      title: '¿Validar múltiples cobros?',
      text: `Estás a punto de aprobar ${ids.length} cobros masivamente.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1e293b',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, aprobar todo',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;

        this.cobroService.validarMultiplesCobros(ids).subscribe({
          next: (res) => {
            // Actualizar estado localmente para feedback inmediato
            this.dataSource.data.forEach(cobro => {
              if (ids.includes(cobro.cobro_id)) {
                cobro.estado = 'Pagado';
              }
            });

            // Refrescar la fuente de datos de la tabla
            this.dataSource._updateChangeSubscription();

            Swal.fire({
              icon: 'success',
              title: '¡Operación Exitosa!',
              text: res.message || 'Los cobros han sido validados.',
              showConfirmButton: false,
              timer: 1500
            });
            this.loading = false;
          },
          error: (err) => {
            console.error('Error en aprobación masiva:', err);
            Swal.fire('Error', 'No se pudo completar la operación masiva.', 'error');
            this.loading = false;
          }
        });
      }
    });
  }


  // UTILIDADES Y FILTROS
  detectMobile() {
    this.responsive.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile = result.matches;
      if (!this.isMobile) {
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  goBack(): void {
    this.location.back();
  }

  // RUTAS DE EDICIÓN
  getEditRoute(item: any): string[] {
    return ['/cobro/edit-cobro'];
  }

  getEditQueryParams(item: any): any {
    const params: any = { id: item.cobro_id };
    if (this.isCobrosPorRuta && this.rutaId) params.rutaId = this.rutaId;
    return params;
  }

  // ELIMINACIÓN (MANTENIDO SEGÚN TU LÓGICA)
  delete = async (item: any) => {
    const confirmed = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
    });

    if (confirmed.isConfirmed) {
      const index = this.cobroData.findIndex(c => c.cobro_id === item.cobro_id);
      if (index > -1) {
        this.cobroData.splice(index, 1);
        this.dataSource.data = [...this.cobroData];
        Swal.fire('Eliminado', 'Cobro eliminado exitosamente', 'success');
      }
    }
  };
}