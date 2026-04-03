import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  CardModule,
  ButtonModule, 
  FormModule, 
  TableModule,
  GridModule
} from '@coreui/angular';
import { CajaDiarioService } from '../../../services/caja-diario..service'; 
import { UsuarioService } from '../../../services/usuario.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cerrar-caja',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CardModule, 
    ButtonModule, 
    FormModule, 
    TableModule,
    GridModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './cerrar-caja.component.html',
  styleUrl: './cerrar-caja.component.scss'
})
export class CerrarCajaComponent implements OnInit {
  // Servicios inyectados modernamente
  private cd = inject(ChangeDetectorRef);

  // Identificadores
  cobradorId: number | null = null;
  cajaDiariaId: number | null = null;
  fechaActual: Date = new Date();
  
  // Control de UI
  loading: boolean = false;
  cargandoCobradores: boolean = false;
  mensajeBackend: string = '';

  // Control de Bloqueos
  cobrosPendientes: number = 0;
  egresosPendientes: number = 0;
  tieneCobrosPendientes: boolean = false;

  // Totales
  montoApertura: number = 0;
  totalCobrosDia: number = 0;
  totalGastosDia: number = 0;
  montoEsperado: number = 0;

  // Liquidación
  montoReal: number = 0;
  diferencia: number = 0;
  listaCobradores: any[] = [];

  constructor(
    private cajaService: CajaDiarioService,
    private usuarioService: UsuarioService,
    private sucursalContext: SucursalContextService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.cargarCobradores();
  }

  cargarCobradores(): void {
    const sucursalId = this.sucursalContext.getSucursalId();
    if (!sucursalId) return;

    this.cargandoCobradores = true;
    this.usuarioService.getCobradoresActivos(sucursalId).subscribe({
      next: (cobradores: any[]) => {
        this.listaCobradores = cobradores.map(c => ({
          id: c.usuario_id,
          nombre: `${c.nombres} ${c.apellidos}`.trim(),
          ruta: c.ruta || 'Sin Ruta'
        }));
        this.cargandoCobradores = false;
        this.cd.detectChanges(); // Forzamos renderizado de la lista
      },
      error: (err) => {
        this.cargandoCobradores = false;
        console.error('Error al cargar cobradores:', err);
        this.mostrarMensaje('No se pudo cargar la lista de cobradores', 'error-snackbar');
      }
    });
  }

  onCobradorChange() {
    if (!this.cobradorId) {
      this.limpiarDatos();
      return;
    }

    this.mensajeBackend = '';
    this.loading = true;

    this.cajaService.getCajaDiariaAbiertaByUsuario(this.cobradorId).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.cajaDiariaId = res.caja_diaria_id;
        this.montoApertura = Number(res.monto_base_inicial);
        this.totalCobrosDia = Number(res.monto_recaudo);
        this.totalGastosDia = Number(res.valor_egresos_confirmados);
        this.montoEsperado = Number(res.monto_final_esperado);

        this.cobrosPendientes = res.cobrosPendientes || 0;
        this.egresosPendientes = res.egresosPendientes || 0;
        this.tieneCobrosPendientes = (this.cobrosPendientes > 0 || this.egresosPendientes > 0);

        this.montoReal = 0;
        this.actualizarDiferencia();
        this.cd.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        this.limpiarDatos();
        const errorMsg = err.error?.error || '⚠️ El cobrador no tiene una caja abierta hoy.';
        this.mensajeBackend = errorMsg;
        this.mostrarMensaje(errorMsg, 'error-snackbar', 5000);
        this.cd.detectChanges();
      }
    });
  }

  actualizarDiferencia() {
    this.diferencia = this.montoReal - this.montoEsperado;
  }

  confirmarCierre() {
    if (this.tieneCobrosPendientes || !this.cajaDiariaId) return;

    // Preparamos los datos del diálogo según la diferencia
    let dialogData: any;
    if (this.diferencia !== 0) {
      dialogData = {
        title: this.diferencia < 0 ? 'Faltante detectado' : 'Sobrante detectado',
        message: `Existe una diferencia de <b>$${this.diferencia.toFixed(2)}</b>. <br>¿Desea proceder con el cierre de todas formas?`,
        confirmText: 'Sí, cerrar con diferencia',
        cancelText: 'Cancelar', 
        color: 'warn',
        icon: 'warning',
        type: 'warning'
      };
    } else {
      dialogData = {
        title: 'Confirmar cierre',
        message: 'El arqueo es exacto. ¿Desea finalizar el cierre de caja?',
        confirmText: 'Sí, cerrar caja',
        cancelText: 'Cancelar',
        color: 'primary',
        icon: 'check_circle',
        type: 'info'
      };
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      disableClose: true,
      data: dialogData // <--- CORREGIDO: Ahora usa dialogData dinámico
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;

      this.loading = true;
      this.cajaService.cerrarCajaDiaria(this.cajaDiariaId!, this.montoReal).subscribe({
        next: () => {
          this.loading = false;
          this.mostrarMensaje('Caja cerrada exitosamente', 'success-snackbar');
          this.cobradorId = null;
          this.limpiarDatos();
          this.cd.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          const msg = err.error?.message || 'Error al procesar el cierre.';
          this.mostrarMensaje(msg, 'error-snackbar');
        }
      });
    });
  }

  limpiarDatos() {
    this.cajaDiariaId = null;
    this.montoApertura = 0;
    this.totalCobrosDia = 0;
    this.totalGastosDia = 0;
    this.montoEsperado = 0;
    this.montoReal = 0;
    this.diferencia = 0;
    this.tieneCobrosPendientes = false;
  }

  private mostrarMensaje(mensaje: string, clase: string, duracion: number = 3000): void {
    this.snackBar.open(mensaje, 'Aceptar', {
      duration: duracion,
      panelClass: [clase],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}