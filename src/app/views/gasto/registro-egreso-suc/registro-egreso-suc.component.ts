import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { CajaService } from '../../../services/caja-sucursal.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
    MatButtonToggleModule,
    MatSelectModule
  ],
  templateUrl: './registro-egreso-suc.component.html',
  styleUrls: ['./registro-egreso-suc.component.scss']
})
export class RegistroEgresoSucComponent implements OnInit {
  private cd = inject(ChangeDetectorRef);
  egresoForm: FormGroup;
  sucursalId: number | null = null;
  totalCaja: number = 0;

  // Listas de categorías según el tipo de movimiento
  categoriasIngreso = ['Aporte a capital'];
  categoriasEgreso = ['Reembolso socios', 'Gasto operacional'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private cajaService: CajaService,
    private sucursalContextService: SucursalContextService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.egresoForm = this.fb.group({
      tipo: ['egreso', Validators.required],
      monto: ['', [Validators.required, Validators.min(0.01)]],
      categoria: ['', Validators.required], // Variable compartida para el selector
      fecha: [new Date().toISOString().substring(0, 10), Validators.required]
    });
  }

  ngOnInit(): void {
    this.sucursalId = this.sucursalContextService.getSucursalId();
    
    if (this.sucursalId) {
      this.loadBalance();
    } else {
      this.snackBar.open('No se ha seleccionado una sucursal activa.', 'Cerrar', { 
        duration: 3000,
        panelClass: ['warning-snackbar'] 
      });
    }

    // Escuchar cambios de tipo para resetear la categoría seleccionada
    this.egresoForm.get('tipo')?.valueChanges.subscribe(() => {
      this.egresoForm.get('categoria')?.setValue('');
      this.cd.detectChanges();
    });
  }

  /**
   * Getter para obtener las categorías según el tipo (Ingreso/Egreso)
   */
  get categoriasActuales(): string[] {
    const tipo = this.egresoForm.get('tipo')?.value;
    return tipo === 'ingreso' ? this.categoriasIngreso : this.categoriasEgreso;
  }

  onSubmit(): void {
    if (this.egresoForm.valid && this.sucursalId) {
      const currentUser = this.authService.getCurrentUser();
      const usuarioId = currentUser?.usuario_id;

      if (!usuarioId) {
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Sesión Expirada',
            message: 'No se pudo identificar al usuario. Inicie sesión nuevamente.',
            type: 'error', icon: 'lock', color: 'warn', confirmText: 'Aceptar'
          }
        });
        return;
      }

      // Mapeamos los datos para el envío
      const data = {
        ...this.egresoForm.value,
        caja_sucursal_id: this.sucursalId,
        usuario_responsable_id: usuarioId,
        tipo_movimiento: this.egresoForm.value.tipo,
        // Usamos el valor de 'categoria' como el concepto principal
        descripcion: this.egresoForm.value.categoria 
      };

      this.cajaService.createMovimiento(data).subscribe({
        next: (res) => {
          this.snackBar.open('Registro guardado correctamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/gasto/list-gasto']);
        },
        error: (err) => {
          console.error('Error detallado:', err);
          const mensajeServidor = err.error?.error || 'No se pudo completar la operación.';

          this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
              title: 'Movimiento Rechazado',
              message: `El sistema indica: <b>${mensajeServidor}</b>`,
              confirmText: 'Corregir',
              cancelText: '',
              type: 'error',
              icon: 'account_balance_wallet',
              color: 'warn'
            }
          });
        }
      });
    }
  }

  loadBalance(): void {
    if (!this.sucursalId) return;
    this.cajaService.getCajaSucursal(this.sucursalId).subscribe({
      next: (balance) => {
        // Aseguramos la actualización de la vista
        this.totalCaja = Number(balance?.saldo_actual) || 0;
        this.cd.detectChanges();
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