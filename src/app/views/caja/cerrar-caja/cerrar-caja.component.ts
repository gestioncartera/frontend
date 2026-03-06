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
    private sucursalContext: SucursalContextService
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
  onCobradorChange() {
    console.log(this.cobradorId);
    if (!this.cobradorId) return;

    this.cajaService.getCajaDiariaAbiertaByUsuario(this.cobradorId).subscribe({
      next: (res:any) => {
        // Mapeo riguroso usando Number() para evitar errores de cálculo
        this.cajaDiariaId = res.caja_diaria_id;
        this.montoApertura = Number(res.monto_base_inicial);
        this.totalCobrosDia = Number(res.monto_recaudo);
        this.totalGastosDia = Number(res.valor_egresos_confirmados);
        this.montoEsperado = Number(res.monto_final_esperado);
            console.log( 'datos trsidos', res);
        // Actualización de estado de pendientes
        this.cobrosPendientes = res.cobrosPendientes;
        this.egresosPendientes = res.egresosPendientes;
        
        // Bloqueo lógico: Si hay cobros O egresos en espera de aprobación
        this.tieneCobrosPendientes = (this.cobrosPendientes > 0 || this.egresosPendientes > 0);

        // Reiniciar campos de digitación
        this.montoReal = 0;
        this.actualizarDiferencia();
      },
      error: (err: any) => {
        console.error('Error al obtener datos de caja:', err);
      }
    });
  }

  actualizarDiferencia() {
    // El cálculo de diferencia es crucial para el widget visual
    this.diferencia = this.montoReal - this.montoEsperado;
  }

  confirmarCierre() {
    if (this.tieneCobrosPendientes) return; // Doble validación de seguridad

    // Validación de integridad de caja antes de enviar al backend
    if (this.diferencia !== 0) {
      const mensaje = this.diferencia < 0
        ? `Existe un FALTANTE de ${Math.abs(this.diferencia)}. ¿Desea proceder con el ajuste?`
        : `Existe un SOBRANTE de ${this.diferencia}. ¿Desea proceder?`;
      
      if (!confirm(mensaje)) return;
    }
    
    // Aquí invocarías al método post para cerrar la caja
    console.log('Enviando datos de cierre:', {
      caja_diaria_id: this.cajaDiariaId,
      monto_final_real: this.montoReal,
      diferencia: this.diferencia
    });
  }
}