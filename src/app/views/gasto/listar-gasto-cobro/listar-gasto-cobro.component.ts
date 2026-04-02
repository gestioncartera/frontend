import { 
  Component, 
  Input, 
  Output, 
  Inject,
  EventEmitter, 
  ViewChild, 
  OnChanges, 
  SimpleChanges, 
  AfterViewInit,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material Imports
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Servicios
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { EgresoOperacion, CajaDiarioService } from '../../../services/caja-diario..service'; 
import { AuthService } from '../../../services/auth.service';

/**
 * Interface para los movimientos de caja
 */
export interface MovimientoCaja {
  id?: number;
  fecha_movimiento: string | Date;  
  tipo_movimiento: string;          
  descripcion: string;
  concepto: string;             
  monto: number;
  valor: number;                    
  estado_movto: string;             
}

@Component({
  selector: 'app-movimientos-table',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './listar-gasto-cobro.component.html',
  styleUrls: ['./listar-gasto-cobro.component.scss']
})
export class ListarGastoCobroComponent implements OnChanges, AfterViewInit, OnInit {
  
  // Entradas de datos y estados
  @Input() data: MovimientoCaja[] = [];
  @Input() isMobile: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() error: string | null = null;

  // Eventos de salida
  @Output() onDelete = new EventEmitter<MovimientoCaja>();
  @Output() onRefresh = new EventEmitter<void>();

  // Configuración de la Tabla
  dataSource = new MatTableDataSource<MovimientoCaja>([]);
  displayedColumns: string[] = ['concepto', 'fecha_movimiento', 'monto'];

  // Referencias a elementos de Material
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  sucursalId: number | null = null;
  usuario_id: number = 0;

  constructor( 
    @Inject(CajaDiarioService) private cajaService: CajaDiarioService,
    private sucursalContextService: SucursalContextService,    
    private authService: AuthService,
    private cd: ChangeDetectorRef // Inyectado para solucionar NG0100
  ) {
    // Personalización del filtrado
    this.dataSource.filterPredicate = (data: MovimientoCaja, filter: string) => {
      const dataStr = `${data.descripcion} ${data.concepto} ${data.monto}`.toLowerCase();
      return dataStr.indexOf(filter) !== -1;
    };
  }

  ngOnInit(): void {
    this.sucursalId = this.sucursalContextService.getSucursalId();
    const currentUser = this.authService.getCurrentUserValue();
   
    if (currentUser) {
       this.usuario_id = currentUser.usuario_id;
        
    }
    
    if (this.usuario_id) {

      this.cargarEgresos();
    }
  }

  private cargarEgresos(): void { 
    this.isLoading = true;
    // Forzamos detección inicial para mostrar el spinner si es necesario
    this.cd.detectChanges();
    this.cajaService.getEgresosOperacionPendientes(this.usuario_id).subscribe({
      next: (resumen: EgresoOperacion[]) => {
        this.dataSource.data = resumen.map((item: EgresoOperacion) => ({
          descripcion: item.descripcion || item.concepto,
          fecha_movimiento: item.fecha_gasto || item.created_at || new Date(),
          monto: item.monto,
          tipo_movimiento: 'egreso',
          concepto: item.concepto,
          valor: item.monto,
          estado_movto: item.estado_egreso || 'pendiente'
        }));
         console.log('egresos',resumen)
        this.isLoading = false;
        this.cd.detectChanges(); // Solución al error NG0100 tras la carga
      },
      error: (err: any) => {
        console.error('Error al cargar resumen de ruta:', err);
        this.error = 'No se pudieron cargar los egresos pendientes.';
        this.isLoading = false;
        this.cd.detectChanges(); // Solución al error NG0100 en caso de error
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.dataSource.data = this.data;
      this.updatePaginator();
    }
  }

  ngAfterViewInit(): void {
    // Usamos setTimeout para evitar NG0100 al inicializar el paginador
    setTimeout(() => {
      this.updatePaginator();
    });
  }

  private updatePaginator(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.paginator._intl.itemsPerPageLabel = 'Items por página:';
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    this.cd.detectChanges();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  emitDelete(item: MovimientoCaja): void {
    this.onDelete.emit(item);
  }

  retryLoad(): void {
    this.cargarEgresos(); // Ahora usa el método interno
    this.onRefresh.emit();
  }
}