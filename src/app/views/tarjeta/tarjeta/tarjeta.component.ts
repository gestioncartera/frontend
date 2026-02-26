import { Component, OnInit } from '@angular/core';
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

interface Pago {
  fecha: string;
  abono: number;
  estado: 'PAGADO' | 'PARCIAL' | 'Pendiente';
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
  montoRecibido: number = 0;
  prestamoId!: number;
  clienteId!: number;
  userId: number | null = null;
  isLoading: boolean = true;

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
    private route: ActivatedRoute,
    private router: Router,
    private prestamoService: PrestamoService,
    private cobroService: CobroService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Obtener usuario autenticado
    const currentUser = this.authService.getCurrentUserValue();
    const userId = currentUser?.id || (currentUser as any)?.usuario_id;
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
      this.prestamoId = +params['prestamoId'] || 1;
      this.cargarDatosPrestamo();
    });
  }

  cargarDatosPrestamo(): void {
    this.isLoading = true;
    this.prestamoService.getPrestamoCobros(this.prestamoId).subscribe({
      next: (data: PrestamoCobros) => {
        // Actualizar datos del cliente
        this.cliente.nombre = data.nombre_cliente;
        this.cliente.prestamoId = `#${data.id_prestamo}`;
        this.clienteId = data.id_prestamo; // Guardar para enviar al crear cobro
        this.cliente.ruta = data.nombre_ruta ?? 'Sin Ruta';
       console.log('Datos del préstamo cargados:', data);

        // Actualizar resumen
        this.resumen.cuotaDelDia = parseFloat(data.valor_cuota);
        this.resumen.saldoTotalPrestamo = parseFloat(data.saldo_pendiente);

        // Convertir datos de cobros al formato de pagos
        this.pagos = data.data.map((cobro: CobroDetalle) => ({
          fecha: new Date(cobro.fecha_cobro).toLocaleDateString(),
          abono: parseFloat(cobro.monto_cobrado),
          estado: cobro.estado as 'PAGADO' | 'PARCIAL' | 'Pendiente'
        }));

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos del préstamo:', error);
        this.isLoading = false;
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
    monto_cobrado: this.montoRecibido
  };

  this.cobroService.createCobro(cobroData).subscribe({
    next: (response: any) => {
      const msg = response.message || response.msg || 'Cobro guardado exitosamente';
      
      this.snackBar.open(msg, 'Cerrar', {
        duration: 2500,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['success-snackbar']
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    },
    error: (error) => {
      // EXTRACCIÓN SEGÚN TU CONSOLA: error -> error -> error
      let errorMsg = 'Error al guardar el cobro';

      if (error.error && error.error.error) {
        // Esto captura: "El préstamo tiene cobros pendientes anteriores"
        errorMsg = error.error.error;
      } else if (error.error?.message) {
        errorMsg = error.error.message;
      }

      this.snackBar.open(errorMsg, 'ENTENDIDO', {
        duration: 5000,
        verticalPosition: 'top', // Aparece arriba para que el cobrador lo vea rápido
        horizontalPosition: 'center',
        panelClass: ['error-snackbar']
      });
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

}
