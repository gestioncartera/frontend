import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services
import { SucursalService, Sucursal } from '../../../services/sucursal.service';

@Component({
  selector: 'app-crear-sucursal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './crear-sucursal.component.html',
  styleUrls: ['./crear-sucursal.component.scss'],
})
export class CrearSucursalComponent {
  // Propiedades del formulario
  nombre: string = '';
  direccion: string = '';
  telefono: string = '';
  estado: string = 'ACTIVA';
  
  // Estado de la interfaz
  loading: boolean = false;

  constructor(
    private router: Router, 
    private sucursalService: SucursalService,
    private snackBar: MatSnackBar
  ) {}

  crear() {
    // 1. Validación de negocio
    if (!this.nombre.trim() || !this.direccion.trim()) {
      this.mostrarMensaje('⚠️ El nombre y la dirección son obligatorios.', 'error-snackbar');
      return;
    }

    this.loading = true;

    // 2. Preparar el objeto (Asegúrate de que en tu interfaz sucursal_id sea opcional sucursal_id?: number)
    const nuevaSucursal: Partial<Sucursal> = {
      nombre: this.nombre.trim(),
      direccion: this.direccion.trim(),
      telefono: this.telefono,
      estado: this.estado,
    };

    // 3. Llamada al servicio
    this.sucursalService.createSucursal(nuevaSucursal as Sucursal).subscribe({
      next: (res) => {
        this.loading = false;
        this.mostrarMensaje('✅ Sucursal creada exitosamente.', 'success-snackbar');
        this.irALista();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al crear sucursal:', err);
        
        // Manejo de error robusto para respuestas HTML/JSON
        const errorMsg = err.error?.error || err.error?.message || 'Error al conectar con el servidor';
        this.mostrarMensaje(`❌ ${errorMsg}`, 'error-snackbar', 5000);
      }
    });
  }

  cancelar() {
    this.irALista();
  }

  private irALista() {
    this.router.navigate(['/sucursal/list-sucursal']);
  }

  private mostrarMensaje(mensaje: string, clase: string, duracion: number = 3000) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: duracion,
      panelClass: [clase],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}