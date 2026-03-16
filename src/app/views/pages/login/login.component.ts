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
  FormFeedbackComponent 
} from '@coreui/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, Usuario } from '../../../services/auth.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';

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
    FormFeedbackComponent 
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private sucursalContextService: SucursalContextService
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
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/cambio-sucursal';
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
      console.log('Respuesta Login:', response);

      let targetUrl: string;

      // 1. Verificación de Rol
      if (this.authService.isCobrador()) {
        const user = response.usuario;

        // 2. Control de Sucursal: Forzamos el ingreso a su sucursal asignada
        if (user && user.sucursal_id) {
          this.sucursalContextService.setSucursalActual({
            id: user.sucursal_id,
            nombre: user.nombre_sucursal || 'Mi Sucursal'
          });
          
          console.log('Sucursal bloqueada para cobrador:', user.sucursal_id);
          targetUrl = '/crear-cobro';
        } else {
          // Si el cobrador no tiene sucursal en DB, bloqueamos el acceso
          this.errorMessage = 'Error: Su cuenta de cobrador no tiene una sucursal asignada.';
          this.loading = false;
          return;
        }
      } else {
        // Si es Admin u otro rol, va a la selección de sucursal o returnUrl
        targetUrl = this.returnUrl;
      }

      // 3. Redirección final
      this.router.navigate([targetUrl]).then(success => {
        if (!success) this.loading = false;
      });
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
