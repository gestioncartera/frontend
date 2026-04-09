import { Component, OnInit } from '@angular/core';
import { NgStyle, CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  FormFeedbackComponent, 
  SpinnerModule
} from '@coreui/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, Usuario } from '../../../services/auth.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { SucursalService } from '../../../services/sucursal.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    NgStyle,
    SpinnerModule,
    FormFeedbackComponent 
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  returnUrl = '';
  nombreSucursal: string = ''; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private sucursalContextService: SucursalContextService,
    private sucursalService: SucursalService
    
  ) {}

  ngOnInit(): void {
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      if (this.authService.isCobrador()) {
        this.router.navigate(['/crear-cobro']);
      } else {
        this.router.navigate(['/cambio-sucursal']);
      }
      return;
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]]
    });

    // Obtener URL de retorno
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/caja-mayor';
  }

onSubmit(): void {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.loading = true;
  this.errorMessage = '';

  const { email, password } = this.loginForm.value;

  this.authService.login(email, password).subscribe({
    next: (response) => {
      const user = response.usuario;

      // 1. Caso Cobrador: Redirección ASÍNCRONA (dentro del segundo subscribe)
      if (this.authService.isCobrador()) {
        if (user && user.sucursal_id) {
          this.sucursalService.getSucursalById(user.sucursal_id).subscribe({
            next: (sucursal: any) => {
              this.sucursalContextService.setSucursalActual({
                id: user.sucursal_id!,
                nombre: sucursal.nombre
              });
              // Redirigimos directamente aquí y salimos
              this.router.navigate(['/crear-cobro']);
            },
            error: () => {
              this.errorMessage = 'Error al verificar sucursal.';
              this.loading = false;
            }
          });
        } else {
          this.errorMessage = 'Error: Su cuenta no tiene una sucursal asignada.';
          this.loading = false;
        }
      } 
      // 2. Caso Otros Roles: Redirección SINCRÓNICA
      else {
        this.router.navigate([this.returnUrl]).then(success => {
          if (!success) this.loading = false;
        });
      }
    },
    error: (error) => {
      console.error('Error en login:', error);
      this.loading = false;
      this.errorMessage = error.error?.message || 'Error al iniciar sesión.';
    }
  });
}
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
