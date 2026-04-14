import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Importar ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Rutas, RutasService } from '../../../services/rutas.service';
import { Usuario, UsuarioService } from '../../../services/usuario.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { AsignarRutaService } from '../../../services/asignarRuta.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';

@Component({
  selector: 'app-edit-ruta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatDividerModule,
    NgxMatSelectSearchModule,
  ],
  templateUrl: './edit-ruta.component.html',
  styleUrls: ['./edit-ruta.component.scss'],
})
export class EditRutaComponent implements OnInit {
  // Inicializamos con un objeto vacío pero tipado
  ruta: Rutas = {} as Rutas;
  
  id: string | null = '';
  cobradores: Usuario[] = [];
  cobradoresFiltrados: Usuario[] = [];
  cobradorSeleccionadoId: number | string = '';
  filtroCobrador: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private rutaService: RutasService,
    private usuarioService: UsuarioService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private asignarRutaService: AsignarRutaService,
    private sucursalContextService: SucursalContextService,
    private cdRef: ChangeDetectorRef // 2. Inyectar el detector de cambios
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.cargarCobradores();
    if (this.id) {
      this.cargarRuta(this.id);
    } else {
      this.router.navigate(['/ruta/list-ruta']);
    }
  }

  cargarCobradores(): void {
    const idSucursal = this.sucursalContextService.getSucursalId();
    if (idSucursal !== null) {
      this.usuarioService.getUsuarios(idSucursal).subscribe({
        next: (usuarios: Usuario[]) => {
          this.cobradores = usuarios.filter(u => u.tipo_usuario === 2);
          this.cobradoresFiltrados = [...this.cobradores];
          this.cdRef.detectChanges(); // Asegurar que el selector se llene
        },
        error: (err) => console.error('Error cobradores:', err)
      });
    }
  }

  cargarRuta(id: string): void {
    this.rutaService.getRutasById(id).subscribe({
      next: (data: any) => {
        const rutaData = Array.isArray(data) ? data[0] : data;

        if (rutaData && (rutaData.ruta_id || rutaData.id)) {
          // 3. Usar el operador spread para crear una nueva referencia de objeto
          this.ruta = { ...rutaData };
          
          // 4. Asegurar que el ID del cobrador sea del mismo tipo que el value del mat-option
          // Si tu base de datos devuelve números, asegúrate que sea número.
          this.cobradorSeleccionadoId = rutaData.usuario_id ? Number(rutaData.usuario_id) : '';
          
          console.log('Ruta cargada correctamente:', this.ruta);
          
          // 5. FORZAR DETECCIÓN DE CAMBIOS
          // Esto soluciona que los inputs se vean vacíos hasta hacer click
          this.cdRef.detectChanges(); 
        } else {
          this.mostrarMensaje('La ruta no existe');
          this.router.navigate(['/ruta/list-ruta']);
        }
      },
      error: (err) => {
        console.error('Error al cargar la ruta:', err);
        this.mostrarMensaje('Error al cargar datos');
        this.router.navigate(['/ruta/list-ruta']);
      }
    });
  }

  // --- Lógica de actualización (Sin cambios mayores, solo limpieza) ---

  actualizar(): void {
    if (!this.ruta.nombre_ruta) {
      this.mostrarMensaje('El nombre es obligatorio');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Actualizar ruta',
        message: `¿Desea guardar los cambios en <b>${this.ruta.nombre_ruta}</b>?`,
        confirmText: 'Guardar',
        cancelText: 'Cancelar',
        color: 'primary',
        icon: 'save',
        type: 'info'
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) this.actualizarRutaConfirmada();
    });
  }

  private actualizarRutaConfirmada(): void {
    const idRuta = this.ruta.ruta_id || this.id;
    if (!idRuta) return;

    this.rutaService.editRutas(Number(idRuta), this.ruta).subscribe({
      next: () => {
        if (this.cobradorSeleccionadoId) {
          this.asignarCobradorARuta(Number(idRuta));
        } else {
          this.mostrarMensaje('Ruta actualizada');
          this.router.navigate(['/ruta/list-ruta']);
        }
      },
      error: () => this.mostrarMensaje('Error al actualizar')
    });
  }

  private asignarCobradorARuta(idRuta: number): void {
    const cobradorId = Number(this.cobradorSeleccionadoId);
    
    this.asignarRutaService.asignaCobrador({
      ruta_id: idRuta,
      usuario_id: cobradorId
    })
    .then(() => {
      this.mostrarMensaje('Ruta y cobrador actualizados');
      this.router.navigate(['/ruta/list-ruta']);
    })
    .catch(err => {
      const msg = err.error?.message || 'Error al asignar cobrador';
      this.mostrarMensaje(msg, 5000);
    });
  }

  private mostrarMensaje(msg: string, duration: number = 3000) {
    this.snackBar.open(msg, 'Cerrar', { duration });
  }

  filtrarCobradores(): void {
    const filtro = this.filtroCobrador.toLowerCase().trim();
    this.cobradoresFiltrados = this.cobradores.filter(c =>
      `${c.nombres} ${c.apellidos}`.toLowerCase().includes(filtro) ||
      (c.dni && c.dni.includes(filtro))
    );
  }

  cancelar() {
    this.router.navigate(['/ruta/list-ruta']);
  }
}