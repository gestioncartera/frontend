import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, of, delay, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { SucursalContextService } from './sucursal-context.service';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  tipoUsuarioId: number;
  tipoUsuario?: string;
  sucursalId?: number;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  tipoUsuarioId: number;
  sucursalId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/usuario`; // Ajustar si tu backend usa /usuario/login
  private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Modo local para desarrollo (cambiar a false cuando la API esté lista)
  private USE_LOCAL_AUTH = false;

  // Usuarios de prueba para desarrollo local
  private mockUsers = [
    {
      id: 1,
      nombre: 'Administrador',
      email: 'admin@test.com',
      password: '123456',
      tipoUsuarioId: 1,
      tipoUsuario: 'Administrador',
      sucursalId: 1
    },
    {
      id: 2,
      nombre: 'Cobrador 1',
      email: 'cobrador@test.com',
      password: '123456',
      tipoUsuarioId: 2,
      tipoUsuario: 'Cobrador',
      sucursalId: 1
    },
    {
      id: 3,
      nombre: 'Juan Pérez',
      email: 'juan@test.com',
      password: '123456',
      tipoUsuarioId: 2,
      tipoUsuario: 'Cobrador',
      sucursalId: 2
    }
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private sucursalContextService: SucursalContextService
  ) {}

  // Obtener valor actual del usuario (sin suscribirse)
  getCurrentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  // Obtener usuario del localStorage
  private getUserFromStorage(): Usuario | null {
    const userStr = localStorage.getItem('currentUser');
    console.log('Obteniendo usuario del storage:', userStr);
    if (!userStr || userStr === 'undefined') {
      if (userStr === 'undefined') {
        localStorage.removeItem('currentUser');
      }
      return null;
    }
    try {
      const user = JSON.parse(userStr);
      console.log('Usuario parseado:', user);
      return user;
    } catch (e) {
      console.error('Error parseando usuario del storage:', e);
      // Limpiar datos corruptos para evitar bloqueo de la app
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      return null;
    }
  }

  // Login Local (Mock)
  private loginLocal(email: string, password: string): Observable<LoginResponse> {
    // Buscar usuario
    const user = this.mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return throwError(() => ({ error: { message: 'Credenciales inválidas' } })).pipe(delay(500));
    }

    const { password: _, ...userWithoutPassword } = user;
    const response: LoginResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      usuario: userWithoutPassword
    };

    return of(response).pipe(
      delay(500),
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('currentUser', JSON.stringify(res.usuario));
        console.log('Guardando usuario en storage (loginLocal):', res.usuario);
        this.currentUserSubject.next(res.usuario);
      })
    );
  }

  // Registro Local (Mock)
  private registerLocal(data: RegisterData): Observable<LoginResponse> {
    // Verificar si el email ya existe
    const existingUser = this.mockUsers.find(u => u.email === data.email);
    
    if (existingUser) {
      return throwError(() => ({ error: { message: 'El email ya está registrado' } })).pipe(delay(500));
    }

    const newUser = {
      id: this.mockUsers.length + 1,
      nombre: data.nombre,
      email: data.email,
      password: data.password,
      tipoUsuarioId: data.tipoUsuarioId,
      tipoUsuario: data.tipoUsuarioId === 1 ? 'Administrador' : 'Cobrador',
      sucursalId: data.sucursalId || 1
    };

    this.mockUsers.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    const response: LoginResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      usuario: userWithoutPassword
    };

    return of(response).pipe(
      delay(500),
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('currentUser', JSON.stringify(res.usuario));
        console.log('Guardando usuario en storage (registerLocal):', res.usuario);
        this.currentUserSubject.next(res.usuario);
      })
    );
  }

  // Login
  login(email: string, password: string): Observable<LoginResponse> {
    if (this.USE_LOCAL_AUTH) {
      return this.loginLocal(email, password); 
    }
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          // Guardar token y usuario en localStorage
          //localStorage.setItem('token', response.token);
          sessionStorage.setItem('token', response.token);
         
          if (response.usuario) {
            localStorage.setItem('currentUser', JSON.stringify(response.usuario));
            console.log('Guardando usuario en storage (login API):', response.usuario);
            this.currentUserSubject.next(response.usuario);
          } else {
            localStorage.removeItem('currentUser');
            this.currentUserSubject.next(null);
            console.warn('No se recibió usuario en la respuesta del login');
          }
        })
      );
  }

  // Registro
  register(data: RegisterData): Observable<LoginResponse> {
    if (this.USE_LOCAL_AUTH) {
      return this.registerLocal(data);
    }
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, data)
      .pipe(
        tap(response => {
          // Guardar token y usuario en localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.usuario));
          console.log('Guardando usuario en storage (register API):', response.usuario);
          this.currentUserSubject.next(response.usuario);
        })
      );
  }

  // Logout
  logout(): void {
    localStorage.clear(); // Limpia todo el localStorage (tokens, usuario, temas, etc.)
    sessionStorage.clear(); // Limpiar también sessionStorage para el token
    this.currentUserSubject.next(null);
    this.sucursalContextService.clearSucursal(); // Limpiar sucursal al cerrar sesión
    this.router.navigate(['/login']);
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    // El token ahora se guarda en sessionStorage
    return !!sessionStorage.getItem('token');
  }

  // Obtener token
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  // Obtener usuario actual
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  // Helper para obtener el rol de forma segura
  private getRolId(): number | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    // Intentamos leer tipoUsuarioId (frontend/mock) o tipo_usuario (backend real)
    const rolId = user.tipoUsuarioId ?? (user as any).tipo_usuario;
    const numericRolId = Number(rolId);
    return isNaN(numericRolId) ? null : numericRolId;
  }

  // Verificar si es admin
  isAdmin(): boolean {
    return this.getRolId() === 1; // Asumiendo que 1 es admin
  }

  // Verificar si es cobrador
  isCobrador(): boolean {
    return this.getRolId() === 2; // Asumiendo que 2 es cobrador
  }
}

