import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select'; // Importante
import { MatTableModule, MatTableDataSource } from '@angular/material/table'; // Importante
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { CajaDiario, CajaDiarioService, EgresoOperacion, MovimientoCajadiario } from '../../../services/caja-diario..service';
import { UsuarioService, Usuario } from '../../../services/usuario.service';

interface Cobrador {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-registro-egreso-diario',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule,
    MatSelectModule, MatTableModule, MatProgressSpinnerModule
  ],
  templateUrl: './registro-egreso-diario.component.html',
  styleUrls: ['./registro-egreso-diario.component.scss']
})
export class RegistroEgresoDiarioComponent implements OnInit {
  egresoForm: FormGroup;
  sucursalId: number | null = null;
  balanceDisponible: number = 0;
  cajaId: number | null = null;
  loading: boolean = false;
  
  // Lógica de Cobradores
  cobradores: Cobrador[] = [];
  cobradorId: number | null = null;
  nombreCobradorSeleccionado: string = '';

  // Historial de la tabla
  dataSource = new MatTableDataSource<EgresoOperacion>([]);
  displayedColumns: string[] = ['fecha', 'concepto', 'monto', 'estado'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private sucursalContextService: SucursalContextService,
    private cajaDiarioService: CajaDiarioService,
    private usuarioService: UsuarioService
  ) {
    this.egresoForm = this.fb.group({
      monto: [null, [Validators.required, Validators.min(0.01)]]
      
    });
  }

  ngOnInit(): void {
    this.sucursalId = this.sucursalContextService.getSucursalId();
    if (this.sucursalId) {
     
      this.cargarCobradores();
    } else {
      this.snackBar.open('⚠️ No se ha seleccionado una sucursal activa.', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/cambio-sucursal']);
    }
  }

  loadBalance(cobradorId: number | null = null): void {
    if (!this.sucursalId) return;
    this.cajaDiarioService.getCaja(this.cobradorId!).subscribe({
      next: (res: any) => {
        this.balanceDisponible = res?.monto_base_inicial || 0;
        this.cajaId = res?.caja_diaria_id || null;
      console.log('Balance disponible cargado:', res); // Depuración

        // Actualizar el validador de monto máximo dinámicamente
        const validators = [Validators.required, Validators.min(0.01)];
        
        // Solo validamos el máximo si hay saldo disponible (es decir, no es apertura)
        if (this.balanceDisponible > 0) {
          validators.push(Validators.max(this.balanceDisponible));
        }
        
        this.egresoForm.get('monto')?.setValidators(validators);
        this.egresoForm.get('monto')?.updateValueAndValidity();
      }
    });
  }

 cargarCobradores(): void {
    if (!this.sucursalId) return;

    this.usuarioService.getCobradoresActivos(this.sucursalId).subscribe({
      next: (usuarios: Usuario[]) => {
        // Mapeamos los datos del backend a nuestra interfaz local Cobrador
        this.cobradores = usuarios.map(u => ({
          id: u.usuario_id ?? 0,// Tomado de la respuesta del backend
          nombre: `${u.nombres} ${u.apellidos}` // Concatenamos para el selector
        }));

        if (this.cobradores.length === 0) {
          this.snackBar.open('ℹ️ No hay cobradores activos en esta sucursal.', 'Cerrar', { duration: 3000 });
        }
      },
      error: (err) => {
        console.error('Error al cargar cobradores:', err);
        this.snackBar.open('❌ Error al conectar con el servidor de usuarios.', 'Cerrar');
      }
    });
  }

  onCobradorChange(id: number): void {
    const seleccionado = this.cobradores.find(c => c.id === id);
    this.nombreCobradorSeleccionado = seleccionado ? seleccionado.nombre : '';
    this.cobradorId = id;
    this.cargarHistorialCobrador(id);
    console.log('Cobrador seleccionado:',    'ID:', id);
    this.loadBalance(this.cobradorId);
  }

  cargarHistorialCobrador(id: number): void {
  console.log('Cargando historial para cobrador ID:', id);
  this.loading = true; // Opcional: activar spinner de carga

  this.cajaDiarioService.getEgresosOperacionPendientes(id).subscribe({
    next: (data: EgresoOperacion[]) => {
      console.log('Movimientos obtenidos:', data);

      // El backend ya debería devolver solo los egresos pendientes para este usuario.
      // No es necesario filtrar de nuevo en el frontend.
      this.dataSource.data = data;
      
      this.loading = false;
    },
    error: (err) => {
      this.loading = false;
      console.error('Error capturado:', err);

      // Extraemos el mensaje específico del backend
      // Estructura según tu imagen: err.error.error
      const mensajeBackend = err.error?.error || 'No se pudo cargar el historial de movimientos';

      // Mostramos el mensaje en el SnackBar para que el usuario sepa qué pasó
      this.snackBar.open(`❌ ${mensajeBackend}`, 'Entendido', {
        duration: 5000,
        panelClass: ['error-snackbar'] // Clase CSS para ponerlo en rojo si deseas
      });
    }
  });
}

  onSubmit(): void {
    this.sucursalId = this.sucursalContextService.getSucursalId();
    if (this.egresoForm.valid && this.sucursalId && this.cobradorId) {
      const monto = this.egresoForm.get('monto')?.value;
      console.log('Monto a guardar:', this.balanceDisponible, monto); // Depuración
      
      let request$;
      if (this.balanceDisponible === 0) {
        request$ = this.cajaDiarioService.abrirCajaDiaria(
          this.sucursalId, this.cobradorId, Number(monto));
      } else if (this.cajaId) {
        request$ = this.cajaDiarioService.updateCajaDiaria(
          this.cajaId, Number(monto));
      } else {
        return;
      }

      request$.subscribe({
        next: (res: any) => {
          this.snackBar.open(res.message || '✅ Operación realizada correctamente', 'Cerrar', { duration: 3000 });
          this.refreshView();
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          this.snackBar.open(err.error?.error || err.error?.message || '❌ Error al guardar', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.egresoForm.markAllAsTouched();
    }
  }

  refreshView(): void {
    this.egresoForm.reset();
    this.loadBalance(this.cobradorId);
    if (this.cobradorId) this.cargarHistorialCobrador(this.cobradorId);
  }

  cancelar(): void {
    this.egresoForm.reset();
    this.cobradorId = null;
    this.nombreCobradorSeleccionado = '';
    this.dataSource.data = [];
  }
}