import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

export type RolUsuario = number;

@Injectable({ providedIn: 'root' })
export class AuthMockService {
  private authService = inject(AuthService);

  getRol(): RolUsuario {
    const user = this.authService.getCurrentUser(); 
    if (!user) {

      return 1; // Default si no hay usuario logueado
    } 
    // tipoUsuarioId: 1 = admin, 2 = cobrador
    // Intentamos leer tipoUsuarioId (Frontend/Mock) o tipo_usuario (Backend común)
    const rolId = user.tipo_usuario;
    return isNaN(Number(rolId)) ? 1 : Number(rolId);
  }

  setRol(rol: RolUsuario): void {
    // Este método ya no es necesario pero lo mantenemos por compatibilidad
    console.warn('setRol() está deprecated. El rol se obtiene automáticamente del usuario logueado.');
  }

  isAdmin(): boolean {
    return this.getRol() === 1;
  }

  isCobrador(): boolean {
    return this.getRol() === 2;
  }
}
