import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';
import { CajaDiarioService } from '../../../services/caja-diario..service';
import { Usuario, UsuarioService } from '../../../services/usuario.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SucursalContextService } from '../../../services/sucursal-context.service';

@Component({
  selector: 'app-apertura-caja',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatFormFieldModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatCardModule, MatDividerModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatInputModule
  ],
  templateUrl: './apertura-caja.component.html',
  styleUrls: ['./apertura-caja.component.scss']
})
export class AperturaCajaComponent implements OnInit {
  cobradores: any[] = [];
  cobradorSeleccionado: any = null;
  montoInicial: number = 0;
  loading: boolean = false;
  sucursalId: number | null = null;

  constructor(
    private cajaService: CajaDiarioService,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private sucursalContextService: SucursalContextService
  ) {}

  ngOnInit(): void {
    this.sucursalId = this.sucursalContextService.getSucursalId();
    this.cargarCobradores();
  }

  cargarCobradores(): void {
    if (!this.sucursalId) return;

    this.loading = true;
    this.usuarioService.getCobradoresActivos(this.sucursalId).subscribe({
      next: (usuarios: Usuario[]) => {
        this.cobradores = usuarios.map(u => ({
          id: u.usuario_id ?? 0,
          nombre: `${u.nombres} ${u.apellidos}`
        }));
        this.loading = false;
        if (this.cobradores.length === 0) {
          this.snackBar.open('ℹ️ No hay cobradores activos en esta sucursal.', 'Cerrar', { duration: 3000 });
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al cargar cobradores:', err);
        this.snackBar.open('❌ Error al conectar con el servidor de usuarios.', 'Cerrar');
      }
    });
  }

  abrirCaja() {
    if (!this.cobradorSeleccionado) {
        Swal.fire('Atención', 'Debe seleccionar un cobrador.', 'info');
        return;
    }

    Swal.fire({
      title: '¿Confirmar apertura de caja?',
      text: `Se iniciará la jornada para ${this.cobradorSeleccionado?.nombre} con un monto inicial de ${this.montoInicial}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1e3a8a',
      confirmButtonText: 'Sí, abrir caja',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        // Nota: Se necesita un método 'abrirCajaDiaria' en CajaDiarioService.
        console.log('Abriendo caja para:', this.cobradorSeleccionado.id, 'con monto:', this.montoInicial);
        this.loading = false;
        Swal.fire('Abierta', 'La caja se ha abierto exitosamente (simulado).', 'success');
      }
    });
  }
}