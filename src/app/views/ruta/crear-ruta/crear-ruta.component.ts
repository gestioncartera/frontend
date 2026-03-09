import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Rutas, RutasService } from '../../../services/rutas.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { SucursalContextService } from '../../../services/sucursal-context.service';

@Component({
  selector: 'app-crear-ruta',
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
  MatDialogModule,
  MatSnackBarModule,
  RouterModule
  ],
  templateUrl: './crear-ruta.component.html',
  styleUrls: ['./crear-ruta.component.scss'],
})
export class CrearRutaComponent {
  
  ruta: Rutas = {
    sucursal_id: 1, // Asignar un valor por defecto o recuperarlo si es necesario
    nombre_ruta: '',
    descripcion: '',
    zona: '',
    estado: 'ACTIVO',
  };

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private rutasService: RutasService,
    private sucursalContextService: SucursalContextService
  ) {
    // Obtener sucursal seleccionada al inicializar
    const sucursal = this.sucursalContextService.getSucursalActual();
    this.ruta.sucursal_id = sucursal ? sucursal.id : 1;
  }

  crear(): void {

  // Validación mínima
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
      title: 'Crear ruta',
      message: `
        ¿Está seguro de que desea crear la ruta
        <b>${this.ruta.nombre_ruta}</b>?
      `,
      confirmText: 'Crear',
      cancelText: 'Cancelar',
      color: 'primary',
      icon: 'add',
      type: 'info'
    }
  });

  dialogRef.afterClosed().subscribe(confirmado => {
    if (confirmado) {
      this.crearRutaConfirmada();
    }
  });
}

private crearRutaConfirmada(): void {

  console.log('Creando ruta con datos:', this.ruta);
  this.rutasService.createRutas(this.ruta).subscribe({
    next: () => {
      this.snackBar.open(
        'Ruta creada exitosamente',
        'Cerrar',
        { duration: 3000 }
      );
      this.router.navigate(['/ruta/list-ruta']);
    },
    error: (err) => {
      console.error('Error al crear la ruta:', err);
      this.snackBar.open(
        'Ocurrió un error al crear la ruta',
        'Cerrar',
        { duration: 4000 }
      );
    }
  });
}

  cancelar() {
    // Navegar a la lista de rutas
    this.router.navigate(['/ruta/list-ruta']);
  }

   
}
