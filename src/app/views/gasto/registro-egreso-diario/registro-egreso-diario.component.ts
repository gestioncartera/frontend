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
    MatSelectModule, MatTableModule
  ],
  templateUrl: './registro-egreso-diario.component.html',
  styleUrls: ['./registro-egreso-diario.component.scss']
})
export class RegistroEgresoDiarioComponent implements OnInit {
  egresoForm: FormGroup;
  sucursalId: number | null = null;
  balanceDisponible: number = 0;
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
      this.loadBalance();
      this.cargarCobradores();
    } else {
      this.snackBar.open('⚠️ No se ha seleccionado una sucursal activa.', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/cambio-sucursal']);
    }
  }

  loadBalance(): void {
    if (!this.sucursalId) return;
    this.cajaDiarioService.getCaja(this.sucursalId).subscribe({
      next: (res: any) => {
        this.balanceDisponible = res.saldo || 0;
        // Actualizar el validador de monto máximo dinámicamente
        this.egresoForm.get('monto')?.setValidators([
          Validators.required, 
          Validators.min(0.01), 
          Validators.max(this.balanceDisponible)
        ]);
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
  }

  cargarHistorialCobrador(id: number): void {
  console.log('Cargando historial para cobrador ID:', id);
  this.loading = true; // Opcional: activar spinner de carga

  this.cajaDiarioService.getEgresosOperacionPendientes(id).subscribe({
    next: (data: EgresoOperacion[]) => {
      const hoy = new Date().toLocaleDateString('en-CA');
      console.log('Movimientos obtenidos:', data);

      // Filtramos por ID de usuario y que la fecha coincida con hoy
      this.dataSource.data = data.filter(m => 
        m.usuario_id === id && m.fecha_gasto?.startsWith(hoy)
      );
      
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
      this.cajaDiarioService.abrirCajaDiaria(this.sucursalId, this.cobradorId, Number(monto)).subscribe({
        next: (res: any) => {
          this.snackBar.open(res.message || '✅ Egreso registrado correctamente', 'Cerrar', { duration: 3000 });
          this.refreshView();
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          this.snackBar.open(err.error?.error || err.error?.message || '❌ Error al guardar el egreso', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.egresoForm.markAllAsTouched();
    }
  }

  refreshView(): void {
    this.egresoForm.reset();
    this.loadBalance();
    if (this.cobradorId) this.cargarHistorialCobrador(this.cobradorId);
  }

  cancelar(): void {
    this.router.navigate(['/gasto/list-gasto']);
  }
}