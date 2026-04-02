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
    this.aprobarCobro();
}

  aprobarCobro() {
    if (!this.cobroId) return;

    Swal.fire({
      title: '¿Aprobar este cobro?',
      text: 'El estado cambiará a "Pagado" y se validará el registro.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1e293b',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Convertimos explícitamente a número para evitar el error TS2345
        const ids: number[] = [Number(this.cobroId)];

        this.cobroService.validarMultiplesCobros(ids).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: '¡Validación Exitosa!',
              text: res.message || 'El cobro ha sido aprobado correctamente.',
              showConfirmButton: false,
              timer: 1500,
            }).then(() => {
              this.regresarALista();
            });
          },
          error: (err) => {
            console.error('Error al aprobar cobro:', err);
            Swal.fire('Error', 'No se pudo completar la aprobación.', 'error');
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
      this.regresarALista();
    }
  });
}

private regresarALista() {
  if (this.rutaId) {
    this.router.navigate(['/cobro/ruta', this.rutaId, 'cobros']);
  } else {
    this.router.navigate(['/cobro/list-cobro']);
  }
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
