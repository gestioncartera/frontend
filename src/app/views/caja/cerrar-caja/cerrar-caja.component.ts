import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  CardModule,
  ButtonModule, 
  FormModule, 
  TableModule,
  GridModule
} from '@coreui/angular';
import { CajaDiario, CajaDiarioService } from '../../../services/caja-diario..service'; // Asegúrate de que la ruta sea correcta
import { UsuarioService } from '../../../services/usuario.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    GridModule
  ],
  templateUrl: './cerrar-caja.component.html',
  styleUrl: './cerrar-caja.component.scss'
})
export class CerrarCajaComponent implements OnInit {
  // Identificadores
  cobradorId: number | null = null;
  cajaDiariaId: number | null = null;
  fechaActual: Date = new Date();
  

  // Control de Bloqueos (según API)
  cobrosPendientes: number = 0; //
  egresosPendientes: number = 0; //
  tieneCobrosPendientes: boolean = false;

  // Totales de Operación (Mapeados de la API)
  montoApertura: number = 0; // monto_base_inicial
  totalCobrosDia: number = 0; // monto_recaudo
  totalGastosDia: number = 0;  // valor_egresos_confirmados
  montoEsperado: number = 0;   // monto_final_esperado

  // Liquidación Manual
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
    if (sucursalId) {
      this.usuarioService.getCobradoresActivos(sucursalId).subscribe({
        next: (cobradores: any[]) => {
          this.listaCobradores = cobradores.map(c => ({
            id: c.usuario_id,
            nombre: `${c.nombres} ${c.apellidos}`,
            ruta: c.ruta || 'Sin Ruta' // Agregamos ruta para evitar errores en el HTML
          }));
        },
        error: (err) => {
          console.error('Error al cargar la lista de cobradores:', err);
        }
      });

      console.log('Datos originales de API:',  this.listaCobradores);
    } else {
      console.error('No hay una sucursal seleccionada para cargar los cobradores.');
    }
  }
 mensajeBackend: string = ''; // Nueva variable para el mensaje

onCobradorChange() {
  if (!this.cobradorId) return;

  // 1. Limpiamos datos y mensajes previos al cambiar de cobrador
  this.limpiarDatos();
  this.mensajeBackend = ''; 

  this.cajaService.getCajaDiariaAbiertaByUsuario(this.cobradorId).subscribe({
    next: (res: any) => {
      // Si la API responde con éxito (200 OK)
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
    },
    error: (err: any) => {
      // 2. CAPTURA DEL MENSAJE DE ERROR (404, 400, etc.)
      console.error('Error al obtener datos de caja:', err);
      
      // Forzamos el monto a 0 para que el HTML reconozca que no hay caja activa
      this.montoApertura = 0; 

       
      const errorMsg = err.error?.error || '⚠️ Error al conectar con el servidor';
      this.mensajeBackend = errorMsg;

      // MOSTRAR SNACKBAR
      this.snackBar.open(`❌ ${errorMsg}`, 'Cerrar', {
        duration: 5000,               // 5 segundos
        horizontalPosition: 'center', // centrado horizontal
        verticalPosition: 'bottom',   // en la parte inferior
        panelClass: ['error-snackbar'] // clase CSS para estilo personalizado
      });
    
    }
  });
}

  actualizarDiferencia() {
    // El cálculo de diferencia es crucial para el widget visual
    this.diferencia = this.montoReal - this.montoEsperado;
  }

  loading: boolean = false;

confirmarCierre() {
  // 1. Validaciones previas de seguridad
  if (this.tieneCobrosPendientes || !this.cajaDiariaId) return;

  // 2. Validación de diferencia (Faltante/Sobrante)
  let dialogData: any;
  if (this.diferencia !== 0) {
    dialogData = {
      title: this.diferencia < 0 ? 'Faltante detectado' : 'Sobrante detectado',
      message: this.diferencia < 0
        ? `Existe un FALTANTE de $${Math.abs(this.diferencia).toFixed(2)}. ¿Desea proceder con el ajuste?`
        : `Existe un SOBRANTE de $${this.diferencia.toFixed(2)}. ¿Desea proceder?`,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar', 
      color: this.diferencia < 0 ? 'warn' : 'primary',
      icon: this.diferencia < 0 ? 'warning' : 'info',
      type: this.diferencia < 0 ? 'warning' : 'info'
    };
  } else {
    dialogData = {
      title: 'Confirmar cierre',
      message: '¿Está seguro de que desea finalizar el cierre de caja?',
      confirmText: 'Sí, cerrar',
      cancelText: 'Cancelar',
      color: 'primary',
      icon: 'check_circle',
      type: 'info'
    };
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

  dialogRef.afterClosed().subscribe((confirmado: boolean) => {
    if (!confirmado) return;

    // 3. Ejecución del cierre
    this.loading = true;
     console.log('Caja cerrada con éxito. ID de caja:', this.cajaDiariaId, 'Monto real:', this.montoReal);
       
    this.cajaService.cerrarCajaDiaria(this.cajaDiariaId!, this.montoReal).subscribe({
      next: () => {
        this.loading = false;
        this.dialog.open(ConfirmDialogComponent, {
          width: '350px',
          data: {
            title: 'Éxito',
            message: 'Caja cerrada exitosamente.',
            confirmText: 'Aceptar',
            color: 'primary',
            icon: 'check_circle',
            type: 'success'
          }
        });
        this.cobradorId = null;
        this.limpiarDatos();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al cerrar caja:', err);
        this.dialog.open(ConfirmDialogComponent, {
          width: '350px',
          data: {
            title: 'Error',
            message: 'Ocurrió un error al procesar el cierre. Intente nuevamente.',
            confirmText: 'Cerrar',
            color: 'warn',
            icon: 'error',
            type: 'error'
          }
        });
      }
    });
  });
}

// Método auxiliar para limpiar la pantalla tras el éxito
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
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: duracion,
      panelClass: [clase],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }


}