import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { delay, filter, map, tap } from 'rxjs/operators';

import { ColorModeService } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons';
import { IdleService } from './services/IdleService.service'; 
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-root',
    template: '<router-outlet />',
    imports: [RouterOutlet]
})
export class AppComponent implements OnInit {
  title = 'Gestion cartera';

  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #titleService = inject(Title);

  readonly #colorModeService = inject(ColorModeService);
  readonly #iconSetService = inject(IconSetService);
  readonly #idleService = inject(IdleService);
  readonly #authService = inject(AuthService);
  constructor(
  ) {
    this.#titleService.setTitle(this.title); 
    this.#iconSetService.icons = { ...iconSubset };
    this.#colorModeService.localStorageItemName.set('coreui-free-angular-admin-template-theme-default');
    this.#colorModeService.eventName.set('ColorSchemeChange');
  }

 ngOnInit(): void {
    // 2. Monitoreo inicial: Si el usuario ya tiene sesión activa al cargar la app (F5)
    if (this.#authService.isLoggedIn()) {
      this.#idleService.startMonitoring();
    }

    // 3. Monitoreo dinámico: Reaccionar a cambios en el estado de autenticación
    // Suponiendo que tu AuthService tiene un observable 'currentUser$' o similar
    this.#authService.currentUser$
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(user => {
        if (user) {
          this.#idleService.startMonitoring();
        } else {
          this.#idleService.stopMonitoring();
        }
      });

    // Tu lógica existente del router
    this.#router.events.pipe(
        takeUntilDestroyed(this.#destroyRef)
      ).subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });

    // Tu lógica existente de temas
    this.#activatedRoute.queryParams
      .pipe(
        delay(1),
        map(params => <string>params['theme']?.match(/^[A-Za-z0-9\s]+/)?.[0]),
        filter(theme => ['dark', 'light', 'auto'].includes(theme)),
        tap(theme => {
          this.#colorModeService.colorMode.set(theme);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }
}
 
