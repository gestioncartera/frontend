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
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Rutas, RutasService } from '../../../services/rutas.service';
import { ActivatedRoute } from '@angular/router';
import { AuthMockService } from '../../../services/AuthMockService';
import { Injectable } from '@angular/core'; 
import { BehaviorSubject, Observable } from 'rxjs';
import { SucursalContextService } from '../../../services/sucursal-context.service';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar'; // 1. Asegúrate de importar esto


@Component({
  selector: 'app-list-ruta',
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
    MatSelectModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './list-ruta.component.html',
  styleUrls: ['./list-ruta.component.scss'],
})
export class ListRutaComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [ // Corregido para que coincida con la interfaz Rutas
    'nombre_ruta',
    'cobrador',
    'zona',
    'estado',
    'created_at',
    'acciones',
  ];
  dataSource: MatTableDataSource<Rutas>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  rutas: Rutas[] = [];
  isMobile = false;
  mode: 'admin' | 'cobrador' = 'admin';
  isAdmin = false;
  isCobrador = false;
  searchKey: string = '';
  statusKey: string = 'todos';
 

  constructor(
    private responsive: BreakpointObserver,
    private router: Router,
    private rutaService: RutasService,
    private route: ActivatedRoute,
    private auth: AuthMockService,
    private sucursalContextService: SucursalContextService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource(this.rutas);
    
  }

  ngOnInit(): void {

    // Seguridad: si el usuario es cobrador, forzar modo cobrador
   const userRol = this.auth.getRol(); // 1 | 2
   const routeMode = this.route.snapshot.data['mode'] as 'admin' | 'cobrador' | undefined;

   this.mode = userRol === 1
     ? (routeMode ?? 'admin')
     : 'cobrador';
     console.log('Modo de la ruta:', userRol);

   this.isAdmin = userRol === 1;
   this.isCobrador = userRol === 2;
  this.configurarColumnas();
    this.detectMobile();
    // Nos suscribimos a los cambios de sucursal para recargar la lista automáticamente
    this.sucursalContextService.sucursalActual$.subscribe(() => {
      this.getRutas();
    });
  }
  configurarColumnas() {
  this.displayedColumns = this.isAdmin
    ? ['nombre_ruta', 'cobrador', 'zona', 'estado', 'created_at', 'acciones']
    : ['nombre_ruta', 'cobrador', 'zona', 'estado'];
}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: Rutas, filter: string): boolean => {
      const filterParts = JSON.parse(filter);
      const searchTerm = filterParts.search.trim().toLowerCase();
      const statusTerm = filterParts.status.trim().toLowerCase();

      const statusMatch = (statusTerm === 'todos' || data.estado?.toLowerCase() === statusTerm);

      if (!statusMatch) {
        return false;
      }

      return (
        data.nombre_ruta.toLowerCase().includes(searchTerm) ||
        (data.cobrador || '').toLowerCase().includes(searchTerm) ||
        (data.zona || '').toLowerCase().includes(searchTerm)
      );
    };
  }

  detectMobile() {
    this.responsive.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile = result.matches;
      if (!this.isMobile) {
        setTimeout(() => (this.dataSource.paginator = this.paginator));
      }
    });
  }

  getRutas() {
    const idSucursal = this.sucursalContextService.getSucursalId(); 
   if (idSucursal !== null) {
    this.rutaService.getRutas(idSucursal).subscribe({
      next: (data: Rutas[]) => {
        this.rutas = data;
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        console.log('Rutas cargadas:', data);
      },
      error: (err) => console.error('Error al cargar rutas:', err)
    });
    
  } else {
    console.warn('No se puede cargar: No hay sucursal seleccionada');
    this.dataSource.data = []; // Limpiamos la tabla si no hay sucursal
  }
  }

  applyFilters() {
    const filterValue = {
      search: this.searchKey,
      status: this.statusKey
    };
    this.dataSource.filter = JSON.stringify(filterValue);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  clearSearch() {
    this.searchKey = '';
    this.applyFilters();
  }

  delete(ruta: Rutas) {
    if (ruta.ruta_id && confirm('¿Deseas eliminar esta ruta?')) {
      this.rutaService.deleteRutas(ruta.ruta_id).subscribe(() => {
        this.getRutas();
      });
    }
  }
 
  editRuta(ruta: Rutas) {
    this.router.navigate(['/ruta/edit-ruta', ruta.ruta_id]);
  } 

  toggleEstadoRuta(ruta: Rutas) {
   const estadoActual = ruta.estado?.toUpperCase();
  
  const nuevoEstado = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
  const accion = nuevoEstado === 'INACTIVO' ? 'desactivar' : 'activar'
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmación',
        message: `¿Seguro que quieres ${accion} esta ruta?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (ruta.ruta_id) {
          const rutaActualizada = { ...ruta, estado: nuevoEstado };

          this.rutaService.editRutas(ruta.ruta_id, rutaActualizada).subscribe({
            next: () => {
              // Mantenemos Swal para el mensaje de éxito por ahora
              this.snackBar.open(
            `✅ Ruta ${accion === 'desactivar' ? 'desactivada' : 'activada'} correctamente`, 
            'Cerrar', 
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
              panelClass: ['snackbar-success'] // Opcional: para darle color verde en CSS
            }
          );
           this.getRutas();
            },
            error: (err) => {
              console.error(`Error al ${accion} la ruta:`, err);
             this.snackBar.open(`❌ No se pudo ${accion} la ruta`, 'Cerrar', { duration: 5000 });
               },
          });
        }
      }
    });
  }

  onRowClick(ruta: Rutas) {
    if (this.mode === 'admin') {
      this.router.navigate(['/ruta/edit-ruta', ruta.ruta_id]);
    } else if (this.mode === 'cobrador') {
      this.router.navigate(['/cobro/ruta', ruta.ruta_id, 'cobros']);
    }
  }
}