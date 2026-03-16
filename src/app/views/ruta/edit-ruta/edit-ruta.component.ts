import { Component, OnInit } from '@angular/core';
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
import { AsignarRutaService,RutaCobro } from '../../../services/asignarRuta.service';
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
    ruta: Rutas = {
    sucursal_id: 1, // Asignar un valor por defecto o recuperarlo si es necesario
    nombre_ruta: '',
    descripcion: '',
    zona: '',
    estado: 'ACTIVO',
  };
  id: string | null = '';
  cobradores: Usuario[] = [];
  cobradoresFiltrados: Usuario[] = [];
  cobradorSeleccionadoId: string | number = '';
  filtroCobrador: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private rutaService: RutasService,
    private usuarioService: UsuarioService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private asignarRutaService:AsignarRutaService,
    private sucursalContextService: SucursalContextService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.cargarCobradores();
    if (this.id) { 
      this.cargarRuta(this.id);
    } else {
      console.error('No se proporcionó ID de ruta para editar.');
      this.router.navigate(['/ruta/list-ruta']);
    }
  }

  cargarCobradores(): void {
    const idSucursal = this.sucursalContextService.getSucursalId(); 
   if (idSucursal !== null) {
    this.usuarioService.getUsuarios(idSucursal).subscribe({
      next: (usuarios: Usuario[]) => {
        // Filtrar solo usuarios con tipo_usuario = 2 (cobradores)
        this.cobradores = usuarios.filter(u => u.tipo_usuario === 2);
        this.cobradoresFiltrados = [...this.cobradores];
        console.log('Cobradores cargados:', this.cobradoresFiltrados);
      },
      error: (err) => {
        console.error('Error al cargar cobradores:', err);
        this.snackBar.open(
          'No se pudieron cargar los cobradores',
          'Cerrar',
          { duration: 3000 }
        );
      }
    });
    }
  }

  filtrarCobradores(): void {
    const filtro = this.filtroCobrador.toLowerCase().trim();
    if (!filtro) {
      this.cobradoresFiltrados = [...this.cobradores];
    } else {
      this.cobradoresFiltrados = this.cobradores.filter(c =>
        c.nombres.toLowerCase().includes(filtro) ||
        c.apellidos.toLowerCase().includes(filtro) ||
        (c.dni && c.dni.includes(filtro))
      );
    }
  }

  cargarRuta(id: string): void {
  this.rutaService.getRutasById(id).subscribe({
    next: (data: any) => {

      const rutaData = Array.isArray(data) ? data[0] : data;

      if (rutaData && rutaData.ruta_id) {
        this.ruta = rutaData;
        // Asignamos el cobrador que ya tiene la ruta para que se muestre en el selector
        this.cobradorSeleccionadoId = rutaData.usuario_id || '';
        console.log('Ruta cargada:', rutaData);
        return;
      }

      // Ruta no encontrada (caso lógico)
      this.snackBar.open(
        'La ruta solicitada no existe o fue eliminada',
        'Cerrar',
        { duration: 3500 }
      );

      this.router.navigate(['/ruta/list-ruta']);
    },

    error: (err) => {
      console.error('Error al cargar la ruta:', err);

      this.snackBar.open(
        'No fue posible cargar los datos de la ruta',
        'Cerrar',
        { duration: 4000 }
      );

      this.router.navigate(['/ruta/list-ruta']);
    }
  });
}


  actualizar(): void {

  if (!this.ruta.nombre_ruta) {
    this.snackBar.open(
      'El nombre de la ruta es obligatorio',
      'Cerrar',
      { duration: 3000 }
    );
    return;
  }

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '420px',
    data: {
      title: 'Actualizar ruta',
      message: `
        ¿Desea guardar los cambios realizados en la ruta
        <b>${this.ruta.nombre_ruta}</b>?
      `,
      confirmText: 'Guardar',
      cancelText: 'Cancelar',
      color: 'primary',
      icon: 'save',
      type: 'info'
    }
  });

  dialogRef.afterClosed().subscribe(confirmado => {
    if (confirmado) {
      this.actualizarRutaConfirmada();
    }
  });
}
private actualizarRutaConfirmada(): void {

  if (!this.ruta.ruta_id) {
    return;
  }

  // Primero actualizar los datos de la ruta
  this.rutaService.editRutas(this.ruta.ruta_id, this.ruta).subscribe({
    next: () => {
      // Si hay un cobrador seleccionado, asignarlo
      if (this.cobradorSeleccionadoId && this.cobradorSeleccionadoId !== '') {
        this.asignarCobradorARuta();
      } else {
        this.snackBar.open(
          'Ruta actualizada exitosamente',
          'Cerrar',
          { duration: 3000 }
        );
        this.router.navigate(['/ruta/list-ruta']);
      }
    },
    error: (err) => {
      console.error('Error al actualizar la ruta:', err);
      this.snackBar.open(
        'Ocurrió un error al actualizar la ruta',
        'Cerrar',
        { duration: 4000 }
      );
    }
  });
}
private asignarCobradorARuta(): void {
  // 1. Validaciones de seguridad
  if (!this.ruta.ruta_id || !this.cobradorSeleccionadoId) {
    return;
  }

  // 2. Preparar el ID del cobrador (asegurar que sea número)
  const cobradorId = typeof this.cobradorSeleccionadoId === 'string' 
    ? parseInt(this.cobradorSeleccionadoId) 
    : this.cobradorSeleccionadoId;
    
    console.log('--- OBJETO ENVIADO AL BACKEND ---');
  console.table({ id_ruta: Number(this.ruta.ruta_id), usuario_id: cobradorId }); // console.table lo muestra mucho más ordenado
  console.log('---------------------------------');

  // 3. Llamar al NUEVO servicio (AsignarRutaService)
  // Nota: Usamos los nombres de campos que pide tu interfaz RutaCobro
  this.asignarRutaService.asignaCobrador({
    ruta_id: Number(this.ruta.ruta_id),
    usuario_id: cobradorId
    
  })
  .then(() => {
    // ÉXITO - Se ejecuta si la promesa se resuelve

    this.snackBar.open(
      'Ruta actualizada y cobrador asignado exitosamente',
      'Cerrar',
      { duration: 3000 }
    );
    this.router.navigate(['/ruta/list-ruta']);
  })
  .catch((err: any) => { // Agregamos ": any" aquí
  console.error('Error al asignar cobrador:', err);
  
  // Intentamos extraer el mensaje específico del backend
  const mensajeError = err.error?.message || err.error?.msg || err.error?.error || 'Hubo un error al asignar el cobrador';

  this.snackBar.open(
    `⚠️ ${mensajeError}`,
    'Cerrar',
    { duration: 5000 }
  );
  this.router.navigate(['/ruta/list-ruta']);
});
}

  cancelar() {
    this.router.navigate(['/ruta/list-ruta']);
  }
}