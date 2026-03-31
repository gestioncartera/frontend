import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services & Interfaces
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { CajaDiarioService, EgresoOperacion } from '../../../services/caja-diario..service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-crear-gasto',
  templateUrl: './crear-gasto.component.html',
  styleUrls: ['./crear-gasto.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
})
export class CrearGastoComponent implements OnInit {
  // Variables de formulario
  concepto: string = '';
  valor: number | null = 0; // Inicializado en 0 para la lógica de UX en el template
  
  // Estado y Contexto
  sucursalId: number | null = null;
  loading: boolean = false;
  usuarioId: number = 0; // Placeholder, deberías obtener esto de tu servicio de autenticación

  constructor(
    private router: Router,
    private sucursalContextService: SucursalContextService,
    private cajaDiarioService: CajaDiarioService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 1. Obtener la sucursal activa desde el contexto global
    this.sucursalId = this.sucursalContextService.getSucursalId();
    
    // 2. Seguridad: Si no hay sucursal, no permitimos el registro
    if (!this.sucursalId) {
      this.snackBar.open('⚠️ No hay una sucursal seleccionada. Redirigiendo...', 'Cerrar', { 
        duration: 3000,
        verticalPosition: 'bottom' 
      });
      this.router.navigate(['/dashboard']);
    }

    // Obtener usuario logueado
    const currentUser = this.authService.getCurrentUserValue();
    if (currentUser) {
      console.log('Usuario actual en CrearGastoComponent:', currentUser);
      this.usuarioId = currentUser.usuario_id
;
    }
  }

  /**
   * Ejecuta el registro del gasto operativo
   */
  crear(): void {
    // Validación de campos obligatorios y lógica de negocio
    if (!this.concepto.trim()) {
      this.mostrarMensaje('⚠️ El concepto es obligatorio', 'error-snackbar');
      return;
    }

    if (!this.valor || this.valor <= 0) {
      this.mostrarMensaje('⚠️ El monto debe ser mayor a cero', 'error-snackbar');
      return;
    }

    this.loading = true;

    // Preparar el objeto según la interfaz del servicio
    const nuevoGasto: EgresoOperacion = { 
      concepto: this.concepto.trim(),
      monto: Number(this.valor),
      usuario_id: this.usuarioId
      // Asumiendo que no se asigna ruta para gastos operativos
      // fecha_gasto: new Date().toISOString() // Descomentar si el backend lo requiere
    };
    console.log('Datos a enviar para nuevo gasto:', nuevoGasto);

    // Llamada al servicio HTTP
    this.cajaDiarioService.createEgresoOperacion(nuevoGasto).subscribe({
            next: (res) => {
        this.loading = false;
        this.mostrarMensaje(res.message || '✅ Gasto registrado correctamente', 'success-snackbar');
        // Limpiar formulario para "refrescar" la vista sin navegar
        this.concepto = '';
        this.valor = 0;
      },
      error: (err) => {
        this.loading = false;
        
        // Manejo de error robusto (Captura respuestas JSON o HTML por fallos de ruta/servidor)
        let mensajeError = 'No se pudo completar el registro';
        
        if (err.status === 404) {
          mensajeError = 'Error 404: La ruta del servidor no fue encontrada.';
        } else if (typeof err.error === 'string' && err.error.includes('<!DOCTYPE html>')) {
          mensajeError = 'El servidor respondió con un error de página (HTML).';
        } else {
          mensajeError = err.error?.error || err.error?.message || mensajeError;
        }

        this.mostrarMensaje(`❌ ${mensajeError}`, 'error-snackbar', 6000);
        console.error('Error detallado:', err);
      }
    });
  }

  /**
   * Regresa a la lista de gastos sin guardar cambios
   */
  cancelar(): void { 
  this.concepto = '';
  this.valor = 0;  
}

  /**
   * Helper para mostrar SnackBars con estilos consistentes
   */
  private mostrarMensaje(mensaje: string, clase: string, duracion: number = 3000): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: duracion,
      panelClass: [clase],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}