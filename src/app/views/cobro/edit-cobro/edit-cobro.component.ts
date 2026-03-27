import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule,
     FormBuilder,
     FormGroup,
     Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CobroService } from '../../../services/cobro.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-edit-cobro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './edit-cobro.component.html',
  styleUrls: ['./edit-cobro.component.scss']
})
export class EditCobroComponent implements OnInit {
  cobroForm: FormGroup;
  cobroId: string | number | null = null;
    rutaId: string | null = null;
  nombreCliente: string = '';
  prestamoId: string = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private cobroService: CobroService,
    private dialog: MatDialog
  ) {
    this.cobroForm = this.fb.group({
      prestamo_id: [{ value: null, disabled: true }],
      usuario_id: [{ value: null, disabled: true }],
      cliente_nombre: [{ value: '', disabled: true }],
      fecha_cobro: [{ value: '', disabled: true }],
      monto_cobrado: [null, [Validators.required, Validators.min(0)]],
      estado: ['pendiente', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.cobroId = params['id'] || null;
      this.rutaId = params['rutaId'] || null;
            this.nombreCliente = params['nombre'];
      this.prestamoId = params['prestamoId']; 
      if (this.cobroId) {
        this.loadCobroData();
      }
    });
  }

  loadCobroData() {
    if (this.cobroId) {
      this.cobroService.getCobro(this.cobroId).subscribe({
        next: (data) => {
          this.cobroForm.patchValue({
            prestamo_id: data.prestamo_id,
            usuario_id: data.usuario_id,
            cliente_nombre: data.cliente_nombre,
            fecha_cobro: data.fecha_cobro,
            monto_cobrado: data.monto_cobrado,
            estado: data.estado
          });
          console.log('Datos del cobro cargados:', data);
        },
        error: (err) => console.error('Error al cargar el cobro', err)
      });
    }
  }

  onSubmit() {
  if (!this.cobroForm.valid) {
    this.cobroForm.markAllAsTouched();
    return;
  }

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '420px',
    disableClose: true,
    data: {
      title: 'Confirmar actualización',
      message: '¿Está seguro de que desea actualizar este cobro?',
      confirmText: 'Actualizar',
      cancelText: 'Cancelar',
      color: 'primary',
      icon: 'edit',
      type: 'warning'
    }
  });

  dialogRef.afterClosed().subscribe(confirmado => {
    if (confirmado) {
      this.actualizarCobro();
    }
  });
}
private actualizarCobro() {
  if (!this.cobroId) return;

  // Enviar todos los campos que requiere el backend
  const cobroData = {
    prestamo_id: this.cobroForm.get('prestamo_id')?.value,
    usuario_id: this.cobroForm.get('usuario_id')?.value,
    fecha_cobro: this.cobroForm.get('fecha_cobro')?.value,
    monto_cobrado: this.cobroForm.get('monto_cobrado')?.value,
    estado: this.cobroForm.get('estado')?.value
  };

  this.cobroService.editCobro(this.cobroId, cobroData).subscribe({
    next: () => {
      this.dialog.open(ConfirmDialogComponent, {
        width: '380px',
        data: {
          title: 'Actualización exitosa',
          message: 'El cobro fue actualizado correctamente.',
          confirmText: 'Aceptar',
          color: 'primary',
          icon: 'check_circle',
          type: 'success'
        }
      }).afterClosed().subscribe(() => {
        // Navegar directamente después de guardar exitosamente
        if (this.rutaId) {
          this.router.navigate(['/cobro/ruta', this.rutaId, 'cobros']);
        } else {
          this.router.navigate(['/cobro/list-cobro']);
        }
      });
    },
    error: (err) => {
      console.error('Error al actualizar el cobro:', err);
      this.dialog.open(ConfirmDialogComponent, {
        width: '380px',
        data: {
          title: 'Error',
          message: 'No se pudo actualizar el cobro.',
          confirmText: 'Aceptar',
          color: 'warn',
          icon: 'error',
          type: 'error'
        }
      });
    }
  });
}

  cancelar() {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '400px',
    data: {
      title: 'Cancelar edición',
      message: '¿Desea salir sin guardar los cambios?',
      confirmText: 'Salir',
      cancelText: 'Continuar editando',
      color: 'warn',
      icon: 'warning',
      type: 'warning'
    }
  });

  dialogRef.afterClosed().subscribe(confirmado => {
    if (confirmado) {
      if (this.rutaId) {
        this.router.navigate(['/cobro/ruta', this.rutaId, 'cobros']);
      } else {
        this.router.navigate(['/cobro/list-cobro']);
      }
    }
  });
}
limpiarCeroRecaudo() {
  const monto = this.cobroForm.get('monto_cobrado')?.value;
  if (monto === 0) {
    this.cobroForm.get('monto_cobrado')?.patchValue(null);
  }
}

// Al salir del campo: si el usuario no escribió nada, devolvemos a 0 para evitar errores
validarVacioRecaudo() {
  const monto = this.cobroForm.get('monto_cobrado')?.value;
  if (monto === null || monto === undefined || monto === '') {
    this.cobroForm.get('monto_cobrado')?.patchValue(0);
  }
}

}

