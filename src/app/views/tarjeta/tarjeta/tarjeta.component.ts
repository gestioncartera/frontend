import { Component, OnInit,NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PrestamoService, PrestamoCobros, CobroDetalle } from '../../../services/prestamo.service';
import { CobroService, CreateCobroDto } from '../../../services/cobro.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
 import { finalize } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';

interface Pago {
  fecha: string;
  abono: number;
  estado: 'PAGADO' | 'PARCIAL' | 'Pendiente';
  cobro_id?: number;
}

@Component({
  selector: 'app-tarjeta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './tarjeta.component.html',
  styleUrls: ['./tarjeta.component.scss']
})
export class TarjetaComponent implements OnInit {

  // ============================
  // Estado UI
  // ============================
  montoRecibido: number | null = 0;
  prestamoId!: number;
  clienteId!: number;
  userId: number | null = null;
  isLoading: boolean = true;
  fechaActual: Date = new Date();
  displayedColumns: string[] = ['fecha', 'abono', 'estado'];

  // ============================
  // Datos del cliente
  // ============================
  cliente = {
    nombre: '',
    prestamoId: '',
    ruta: ''
  };

  // ============================
  // Resumen del préstamo
  // ============================
  resumen = {
    cuotaDelDia: 0,
    pagadoHoy: 0,
    saldoTotalPrestamo: 0
  };

  // ============================
  // Historial de pagos
  // ============================
  pagos: Pago[] = [];

  constructor(
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private router: Router,
    private prestamoService: PrestamoService,
    private cobroService: CobroService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    // Obtener usuario autenticado
    const currentUser = this.authService.getCurrentUserValue();
    const userId = currentUser?.usuario_id || (currentUser as any)?.usuario_id;
    console.log('Usuario autenticado ID:', userId);   
    if (!currentUser || !userId) {
      this.snackBar.open('Debe iniciar sesión para realizar cobros', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      this.router.navigate(['/login']);
      return;
    }
    this.userId = userId;
    

    // Obtener prestamoId de los query params
    this.route.queryParams.subscribe(params => {
      this.prestamoId = +params['prestamoId'] || 0;
      this.cargarDatosPrestamo();
    });
  }

 cargarDatosPrestamo(): void {
  this.isLoading = true;

  this.prestamoService.getPrestamoCobros(this.prestamoId)
    .pipe(
      finalize(() => {
        this.isLoading = false; 
        this.cdr.detectChanges(); // <--- CRÍTICO: Fuerza a Angular a pintar la vista
      })
    )
    .subscribe({
      next: (data: PrestamoCobros) => {
        // Datos del cliente
        this.cliente.nombre = data.nombre_cliente;
        this.cliente.prestamoId = `#${data.id_prestamo}`;
        this.clienteId = data.id_prestamo;
        this.cliente.ruta = data.nombre_ruta ?? 'Sin Ruta';

        // Resumen
        this.resumen.cuotaDelDia = parseFloat(data.valor_cuota);
        this.resumen.saldoTotalPrestamo = parseFloat(data.saldo_pendiente);

        // Transformación de pagos
        this.pagos = data.data.map((cobro: CobroDetalle) => ({
          fecha: new Date(cobro.fecha_cobro).toLocaleDateString(),
          abono: parseFloat(cobro.monto_cobrado),
          estado: cobro.estado as 'PAGADO' | 'Pendiente',
          cobro_id: cobro.cobro_id
        }));
        
        console.log('Datos cargados y procesados');
      },
      error: (error) => {
        console.error('Error al cargar datos del préstamo:', error);
        this.snackBar.open('Error al obtener datos del servidor', 'Cerrar', { duration: 3000 });
      }
    });
}

  // ============================
  // Guardar pago del día
  // ============================
  guardarCobro(): void {
    if (!this.montoRecibido || this.montoRecibido <= 0) {
      this.snackBar.open('Por favor ingrese un monto válido', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    if (!this.userId) {
      this.snackBar.open('No se pudo identificar el usuario. Por favor inicie sesión nuevamente.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      this.router.navigate(['/login']);
      return;
    }

    // Mostrar diálogo de confirmación
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Confirmar cobro',
        message: `¿Está seguro de que desea registrar un cobro de <b>$${this.montoRecibido.toFixed(2)}</b>?`,
        confirmText: 'Guardar',
        cancelText: 'Cancelar',
        color: 'primary',
        icon: 'save',
        type: 'info'
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.guardarCobroConfirmado();
      }
    });
  }

private guardarCobroConfirmado(): void {
  const cobroData: CreateCobroDto = {
    prestamo_id: this.prestamoId,
    usuario_id: this.userId!,
    monto_cobrado: this.montoRecibido || 0
  };

  this.cobroService.createCobro(cobroData).subscribe({
    next: (response: any) => {
      // Manejo de éxito...

      //this.imprimirTirilla();
      this.snackBar.open('Cobro guardado con éxito', 'Cerrar', { duration: 3000, panelClass: ['success-snackbar'] });
      
      this.montoRecibido = 0; // Reset input
      this.cargarDatosPrestamo(); // Refresh data without reloading the whole app
    },
    error: (err) => {
      console.error('DEBUG:', err);
      
      let errorMsg = 'Error al guardar el cobro';
 
      if (err.error) {
        if (typeof err.error === 'string') {
          errorMsg = err.error;
        } else if (err.error.message) {
          errorMsg = Array.isArray(err.error.message) 
            ? err.error.message.join(', ') 
            : err.error.message;
        } else if (err.error.error) {
          errorMsg = err.error.error;
        } else if (err.error.msg) {
          errorMsg = err.error.msg;
        }
      }   
        

      this.snackBar.open(`⚠️ ${errorMsg}`, 'Cerrar', {
        duration: 10000, 
        verticalPosition: 'bottom',
          horizontalPosition: 'center',
    panelClass: ['error-snackbar']
      }
    
    
    
    );
    }
    
  });
}
confirmarEdicionRapida(pago: any) {
  console.log('Nuevo abono a guardar:', pago);  
  this.validarAbonoTemporal(pago);
}

validarAbonoTemporal(pago: any) {
  if (pago.abono < 0) pago.abono = 0;
 console.log('Monto de cobro actualizado con caja:', pago);
  this.cobroService.updateMontoCobroConCaja(pago.cobro_id, pago.abono).subscribe({
    next: (response) => {
      this.snackBar.open('Monto de cobro actualizado con éxito', 'Cerrar', { duration: 3000 });
      this.cargarDatosPrestamo();
     console.log("prueba",pago)
    // this.imprimirTirilla();
    },
    error: (err) => {
      console.error('Error al actualizar monto de cobro:', err);
      this.snackBar.open('Error al actualizar el monto del cobro', 'Cerrar', { duration: 3000 });
    }
  });
}  

  // ============================
  // Volver al menú anterior
  // ============================
  volver(): void {
    this.router.navigate(['/cobro/crear-cobro']).catch(err => {
      console.error('Error al navegar:', err);
    });
  }

  imprimirTirilla() {
  this.fechaActual = new Date(); // Actualizar fecha al momento exacto
  
  // Pequeño delay para asegurar que Angular renderizó los datos en el div oculto
  setTimeout(() => {
    window.print();
  }, 200);
}

}
