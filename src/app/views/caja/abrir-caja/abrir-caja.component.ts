import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'; // 👈 Nuevo
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { UsuarioService, Usuario } from '../../../services/usuario.service';
import { CajaDiario, CajaDiarioService, EgresoOperacion, MovimientoCajadiario } from '../../../services/caja-diario..service';

interface Cobrador {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-abrir-caja',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './abrir-caja.component.html',
  styleUrls: ['./abrir-caja.component.scss']
})
export class AbrirCajaComponent implements OnInit {
  cajaForm: FormGroup;
    sucursalId: number | null = null;
  listaCobradores: Cobrador[] = [];
  cobradorId: number | null = null;
  nombreCobradorSeleccionado: string = '';
  fechaHoy: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private sucursalContextService: SucursalContextService,
    private snackBar: MatSnackBar,
    private router: Router,
    private usuarioService: UsuarioService,    
    private cajaDiarioService: CajaDiarioService,
  ) {
    this.cajaForm = this.fb.group({
      cobrador_id: ['', Validators.required], // 👈 Selector obligatorio
      base: [0, [Validators.required, Validators.min(0)]],
      notas: ['']
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

cargarCobradores(): void {
    if (!this.sucursalId) return;
    this.usuarioService.getCobradoresActivos(this.sucursalId).subscribe({
      next: (usuarios: Usuario[]) => {
        // Mapeamos los datos del backend a nuestra interfaz local Cobrador
        this.listaCobradores = usuarios.map(u => ({
          id: u.usuario_id ?? 0,// Tomado de la respuesta del backend
          nombre: `${u.nombres} ${u.apellidos}` // Concatenamos para el selector
        }));
  console.log('Cargando cobradores para sucursal ID:', this.listaCobradores);
    
        if (this.listaCobradores.length === 0) {
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
    const seleccionado = this.listaCobradores.find(c => c.id === id);
    this.nombreCobradorSeleccionado = seleccionado ? seleccionado.nombre : '';
    this.cobradorId = id; 
    console.log('Cobrador seleccionado:',    'ID:', id);
    
  }

 confirmarAperturacaja() {
  if (this.cajaForm.invalid) {
    this.cajaForm.markAllAsTouched();
    return;
  }

  // Resolvemos los valores en constantes locales para asegurar tipado
  const idSucursal = this.sucursalContextService.getSucursalId();
  const idCobrador = this.cajaForm.get('cobrador_id')?.value;
  const montoBase = Number(this.cajaForm.get('base')?.value);

  // Validación de seguridad contra nulos
  if (idSucursal === null || idCobrador === null) {
    this.snackBar.open('⚠️ Error: Faltan datos de sucursal o cobrador.', 'Cerrar', { duration: 3000 });
    return;
  }

  // Llamado al servicio usando los valores validados
  this.cajaDiarioService.abrirCajaDiaria(idSucursal, idCobrador, montoBase)
    .subscribe({
      next: (res: any) => {
        this.snackBar.open(res.message || '✅ Caja abierta correctamente', 'Cerrar', { duration: 3000 });
        this.refreshView();
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        const errorMsg = err.error?.error || err.error?.message || '❌ Error al intentar abrir la caja';
        this.snackBar.open(errorMsg, 'Cerrar', { duration: 3000 });
      }
    });
}

    refreshView(): void {
    this.cajaForm.reset();
    }
    
  
}