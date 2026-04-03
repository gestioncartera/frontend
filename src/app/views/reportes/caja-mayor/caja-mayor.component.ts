import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CajaService } from '../../../services/caja-sucursal.service';
import { CobroService } from '../../../services/cobro.service';
import { SucursalService, Sucursal } from '../../../services/sucursal.service';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

export interface CajaMayorData {
  caja_inicial: number;
  caja_actual: number;
  entradas: {
    cobros: number;
    cheques_cobrados: number;
    aportes: number;
    liquido_a_depositar: number;
  };
  salidas: {
    gastos: number;
    deposito_a_banco: number;
    prestamos: number;
    reembolso_a_socios: number;
    base_diaria: number;
  };
  metricas_adicionales: {
    cuentas_por_cobrar: number;
    rendimiento: number;
    fecha: string;
  };
}

@Component({
  selector: 'app-caja-mayor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './caja-mayor.component.html',
  styleUrls: ['./caja-mayor.component.scss']
})
export class CajaMayorComponent implements OnInit {

   sucursales: Sucursal[] = [];
  
  sucursalSeleccionada: number = 1;
  isLoading: boolean = false; 
  // Datos basados en tu captura de pantalla
  datosCaja: CajaMayorData = {
    caja_inicial: 2373,
    caja_actual: 259393,
    entradas: {
      cobros: 10866086,
      cheques_cobrados: 0,
      aportes: 44000,
      liquido_a_depositar: 26411025
    },
    salidas: {
      gastos: 609975,
      deposito_a_banco: 0,
      prestamos: 9654160,
      reembolso_a_socios: 0,
      base_diaria: 26198005
    },
    metricas_adicionales: {
      cuentas_por_cobrar: 948115,
      rendimiento: 1448124,
      fecha: 'Viernes [ 5.Sep.2025 ]'
    }
  };

  constructor(
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private cajaService: CajaService,
    private cobroService: CobroService,
    private sucursalService: SucursalService,
  ) { }

  ngOnInit(): void {
    this.obtenerListaSucursales();
    this.cargarDatosCaja();
  }
  obtenerListaSucursales(): void { 
    this.sucursalService.getSucursales().subscribe({
      next: (data: Sucursal[]) => {
        this.sucursales = data; 
        if (this.sucursales.length > 0) {
          this.sucursalSeleccionada = this.sucursales[0].sucursal_id;
          this.cargarDatosCaja(); // Cargar datos iniciales
        }
        this.cd.detectChanges();        
      },
      error: (err:any) => console.error('Error al cargar sucursales:', err)
    });
    
  }

  verHistorial(): void {
    console.log('Abriendo historial...');
  }

   cargarDatosCaja(): void {
    if (!this.sucursalSeleccionada) return;

    this.isLoading = true;

    // Ejecutamos las peticiones en paralelo
    forkJoin({
      cajaInicial: this.cajaService.getCajaInicialSucursal(this.sucursalSeleccionada),
      sumatoriaCobros: this.cobroService.getSumatoriaCobrosSucursal(this.sucursalSeleccionada),
      cajaInfo: this.cajaService.getCajaSucursal(this.sucursalSeleccionada)
      // Agrega aquí más peticiones si tienes otros servicios para gastos o préstamos
    }).subscribe({
      next: (res) => {
        // Actualizamos el objeto datosCaja con la información real
        this.datosCaja = {
          ...this.datosCaja, // Mantenemos valores por defecto para lo que no venga de la API
          caja_inicial: res.cajaInicial,
          caja_actual: Number(res.cajaInfo?.saldo_actual || 0),
          entradas: {
            ...this.datosCaja.entradas,
            cobros: res.sumatoriaCobros
          },
          metricas_adicionales: {
            ...this.datosCaja.metricas_adicionales,
            fecha: res.cajaInfo?.fecha_ultima_actualizacion || new Date().toLocaleDateString()
          }
        };
  
        this.isLoading = false;
        this.cd.detectChanges();
         console.log('dddd',this.datosCaja)
      },
      error: (err) => {
        console.error('Error al sincronizar datos de caja mayor:', err);
        this.isLoading = false;
        this.snackBar.open('❌ Error al cargar los datos financieros', 'Cerrar', {
          duration: 3000
        });
        this.cd.detectChanges();
      }
    });
  }
}