import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UsuarioService, Usuario } from '../../../services/usuario.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';

interface TipoUsuario {
  id: number;
  nombre: string;
  icono: string;
}

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './crear-usuario.component.html',
  styleUrls: ['./crear-usuario.component.scss']
})
export class CrearUsuarioComponent implements OnInit {
  usuarioForm!: FormGroup;
  loading = false;

  tiposUsuario: TipoUsuario[] = [
    { id: 1, nombre: 'Administrador', icono: 'admin_panel_settings' },
    { id: 2, nombre: 'Cobrador', icono: 'directions_run' } 
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private sucursalContextService: SucursalContextService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.usuarioForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      dni: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]], // Requerido por backend
      telefono: ['', [Validators.pattern(/^[0-9]{7,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]], // Requerido por backend
      tipo_usuario: [2, [Validators.required]] // Por defecto Cobrador
    });
  }

  get nombres() { return this.usuarioForm.get('nombres'); }
  get apellidos() { return this.usuarioForm.get('apellidos'); }
  get dni() { return this.usuarioForm.get('dni'); }
  get email() { return this.usuarioForm.get('email'); }
  get password() { return this.usuarioForm.get('password'); }

  get selectedTipo() {
    const id = this.usuarioForm.get('tipo_usuario')?.value;
    return this.tiposUsuario.find(t => t.id === id);
  }

  // --- MÉTODOS DE ERROR EXIGIDOS POR EL HTML ---
  getNombresError(): string {
    if (this.usuarioForm.get('nombres')?.hasError('required')) return 'Los nombres son requeridos';
    return this.usuarioForm.get('nombres')?.hasError('minlength') ? 'Mínimo 2 caracteres' : '';
  }

  getApellidosError(): string {
    if (this.usuarioForm.get('apellidos')?.hasError('required')) return 'Los apellidos son requeridos';
    return this.usuarioForm.get('apellidos')?.hasError('minlength') ? 'Mínimo 2 caracteres' : '';
  }

  getEmailError(): string {
    if (this.usuarioForm.get('email')?.hasError('required')) return 'El email es requerido';
    return this.usuarioForm.get('email')?.hasError('email') ? 'Email inválido' : '';
  }

  onSubmit(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const sucursalId = this.sucursalContextService.getSucursalId(); //
    
    if (!sucursalId) {
      this.snackBar.open('❌ Error: No se identificó la sucursal activa', 'Cerrar', { duration: 3000 });
      return;
    }

    this.loading = true;

    const nuevoUsuario: Usuario = {
      ...this.usuarioForm.value,
      sucursal_id: sucursalId, //
      estado: 'activo' // Valor fijo para nuevos registros
    };

    this.usuarioService.createUsuario(nuevoUsuario).subscribe({
      next: () => {
        this.snackBar.open('✅ Usuario registrado con éxito', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/usuario/list']);
      },
      error: (err) => {
        console.error('API Error:', err);
        this.snackBar.open('❌ Error al conectar con el servidor', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/usuario/list']);
  }
}