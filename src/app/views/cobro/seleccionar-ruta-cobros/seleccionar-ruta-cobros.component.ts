import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Rutas, RutasService } from '../../../services/rutas.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';

@Component({
  selector: 'app-seleccionar-ruta-cobros',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './seleccionar-ruta-cobros.component.html',
  styleUrls: ['./seleccionar-ruta-cobros.component.scss'],
})
export class SeleccionarRutaCobrosComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'nombre_ruta',
    'cobrador',
    'zona',
    'created_at',
    'acciones',
  ];
  dataSource: MatTableDataSource<Rutas>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  rutas: Rutas[] = [];
  searchKey: string = '';
  isMobile = false;

  constructor(
    private router: Router,
    private rutaService: RutasService,
    private responsive: BreakpointObserver,
    private sucursalContextService: SucursalContextService
  ) {
    this.dataSource = new MatTableDataSource(this.rutas);
  }

  ngOnInit(): void {
    this.detectMobile();
    this.sucursalContextService.sucursalActual$.subscribe(() => {
      this.getRutasActivas();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  detectMobile() {
    this.responsive.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile = result.matches;
      if (!this.isMobile) {
        setTimeout(() => (this.dataSource.paginator = this.paginator));
      }
    });
  }

  getRutasActivas() {
    const idSucursal = this.sucursalContextService.getSucursalId();
    if (!idSucursal) {
      return;
    }

    this.rutaService.getRutas(idSucursal).subscribe({
      next: (data: Rutas[]) => {
        
        
        // Filtrar solo rutas activas (case-insensitive)
        this.rutas = data.filter(ruta => {
          const estado = ruta.estado?.toLowerCase().trim();
            return estado === 'activo' || estado === 'activa';
        });
        
         
        // Actualizar el dataSource
        this.dataSource = new MatTableDataSource(this.rutas);
        
        // Asegurar que paginator y sort estén asignados
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
        }, 0);
        
          },
      error: (error) => {
        console.error('Error al cargar rutas activas:', error);
      }
    });
  }

  applyFilter() {
    const filterValue = this.searchKey.trim().toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  verCobrosRuta(ruta: Rutas) {
    // Navegar a la vista de cobros filtrando por ruta
    this.router.navigate(['/cobro/ruta', ruta.ruta_id, 'cobros']);
  }

  onSearchClear() {
    this.searchKey = '';
    this.applyFilter();
  }
}
