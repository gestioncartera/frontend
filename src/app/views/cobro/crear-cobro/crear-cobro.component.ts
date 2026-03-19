import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Cliente,  ClienteService } from '../../../services/cliente.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-crear-cobro',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './crear-cobro.component.html',
  styleUrls: ['./crear-cobro.component.scss']
})
export class CrearCobroComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['nombrecliente', 'direccioncliente', 'telefonocliente', 'acciones'];
  dataSource: MatTableDataSource<Cliente>;
  isMobile = false;
  

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private router: Router,
    private clienteService: ClienteService,
    private responsive: BreakpointObserver,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Cliente>([]);
  }

 
  ngOnInit(): void {
    this.detectMobile();
    this.cargarClientes();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  detectMobile() {
    this.responsive.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile = result.matches;
    });
  }

  cargarClientes(): void {
    const user = this.authService.getCurrentUserValue();
    // Intenta obtener 'id' (frontend/mock) o 'usuario_id' (backend real)
    const userId = user?.usuario_id || (user as any)?.usuario_id;
    
    if (userId) {
      this.clienteService.getClientesByRutaPrestamo(userId).subscribe({
        next: (data) => {
          console.log('Clientes cargados:', data);
          this.dataSource.data = data;
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        },
        error: (err) => {
          console.error('Error al cargar clientes:', err);
          const errorMsg = err.error?.message || 'No se pudieron cargar los clientes.';
          this.snackBar.open(`⚠️ ${errorMsg}`, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      console.error('No se encontró usuario logueado o ID válido. Objeto usuario:', user);
      this.snackBar.open('⚠️ No se pudo identificar al usuario. Por favor, inicie sesión de nuevo.', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  verDetalles(cliente: Cliente): void {
    // Navegar a la vista de préstamos del cliente
    console.log('Navegando a préstamos del cliente:', cliente.cliente_id);
    this.router.navigateByUrl(`/prestamo/prestamos-cliente/${cliente.cliente_id}`).catch(err => {
      console.error('Error en navegación:', err);
    });
  }
 
  cancelar() {
    this.router.navigate(['/cobro/list-cobro']);
  }
}