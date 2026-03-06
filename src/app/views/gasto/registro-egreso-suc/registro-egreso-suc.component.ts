import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { CajaService } from '../../../services/caja-sucursal.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-registro-egreso-suc',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatButtonToggleModule
  ],
  templateUrl: './registro-egreso-suc.component.html',
  styleUrls: ['./registro-egreso-suc.component.scss']
})
export class RegistroEgresoSucComponent implements OnInit {
  egresoForm: FormGroup;
  sucursalId: number | null = null;
    totalCaja: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private cajaService: CajaService,
    private sucursalContextService: SucursalContextService,
    private authService: AuthService
  ) {
    this.egresoForm = this.fb.group({
      tipo: ['egreso', Validators.required],
      monto: ['', [Validators.required, Validators.min(0.01)]],
      descripcion: ['', Validators.required],
      fecha: [new Date().toISOString().substring(0, 10), Validators.required]
    });
  }

  ngOnInit(): void {
  this.sucursalId = this.sucursalContextService.getSucursalId();
  
  if (this.sucursalId) {
    // Si tenemos ID, cargamos el balance inmediatamente
    this.loadBalance();
  } else {
    this.snackBar.open('No se ha seleccionado una sucursal activa.', 'Cerrar', { 
      duration: 3000,
      panelClass: ['warning-snackbar'] 
    });
    // Opcional: Redirigir si no hay sucursal
    // this.router.navigate(['/dashboard']);
  }
}

onSubmit(): void {
  if (this.egresoForm.valid && this.sucursalId) {
    const currentUser = this.authService.getCurrentUser();
    const usuarioId = currentUser?.usuario_id;

    if (!usuarioId) {
      this.snackBar.open('Error: No se pudo identificar al usuario. Inicie sesión nuevamente.', 'Cerrar', { duration: 3000 });
      return;
    }

    const data = {
      ...this.egresoForm.value,
      caja_sucursal_id: this.sucursalId, // Usar el ID de la sucursal seleccionada
      usuario_responsable_id: usuarioId, // Requerido según tu imagen
      tipo_movimiento: this.egresoForm.value.tipo // 'ingreso' o 'egreso'
    };

    this.cajaService.createMovimiento(data).subscribe({
      next: (res) => {
        this.snackBar.open('Registro guardado correctamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/gasto/list-gasto']);
      },
      error: (err) => {
        this.snackBar.open('Error: ' + (err.error?.msg || 'No se pudo guardar'), 'Cerrar', { duration: 5000 });
      }
    });
  }
}

  eliminar(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este registro?')) {
      this.cajaService.deleteMovimiento(id).subscribe({
        next: () => {
          this.snackBar.open('Registro eliminado correctamente', 'Cerrar', { duration: 3000 });
          // Redirigir a la lista después de eliminar
          this.router.navigate(['/gasto/list-gasto']);
        },
        error: (err) => {
          this.snackBar.open('Error al eliminar: ' + (err.error?.msg || 'No se pudo eliminar'), 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  loadBalance(): void {
    if (!this.sucursalId) return;
    this.cajaService.getCajaSucursal(this.sucursalId).subscribe({
      next: (balance) => {
        this.totalCaja = Number(balance?.saldo_actual) || 0;
        console.log('Balance de caja cargado:', this.totalCaja);
      },
      error: (err) => {
        console.error('Error al cargar el balance', err);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/gasto/list-gasto']);
  }
}