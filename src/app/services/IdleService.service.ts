import { Injectable, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, timer, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class IdleService {
  // Uso de inject() para un estilo más moderno (opcional, según tu versión de Angular)
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  private idleTimerSubscription?: Subscription;
  private readonly timeoutSeconds = 300; // 5 minutos

  // Definimos los eventos que se consideran "actividad"
  private userActivity$ = merge(
    fromEvent(window, 'mousemove'),
    fromEvent(window, 'click'),
    fromEvent(window, 'keydown'),
    fromEvent(window, 'scroll'),
    fromEvent(window, 'touchstart')
  );

  /**
   * Inicia el monitoreo de inactividad.
   * Se debe llamar después de un login exitoso.
   */
  startMonitoring() {
    // Primero detenemos cualquier monitoreo previo para evitar duplicados
    this.stopMonitoring();

    // Ejecutamos fuera de la zona de Angular para que el movimiento 
    // del mouse no dispare la detección de cambios constantemente.
    this.ngZone.runOutsideAngular(() => {
      this.idleTimerSubscription = this.userActivity$
        .pipe(
          // Cada vez que hay actividad, reiniciamos el temporizador de 5 min
          switchMap(() => timer(this.timeoutSeconds * 1000))
        )
        .subscribe(() => {
          // Cuando el timer se cumple, volvemos a la zona de Angular para cerrar sesión
          this.ngZone.run(() => {
            this.logoutUser();
          });
        });
    });
  }

  /**
   * Detiene el monitoreo y limpia la suscripción.
   */
  stopMonitoring() {
    if (this.idleTimerSubscription) {
      this.idleTimerSubscription.unsubscribe();
      this.idleTimerSubscription = undefined;
    }
  }

  private logoutUser() {
    console.warn('Sesión expirada por inactividad de 5 minutos');
    
    // 1. Limpiamos datos de sesión (token, localStorage, etc.)
    this.authService.logout(); 
    
    // 2. Detenemos el monitoreo
    this.stopMonitoring();
    
    // 3. Redirigimos al login
    this.router.navigate(['/login']);
  }
}