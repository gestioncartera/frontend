import { NgIf, CommonModule } from '@angular/common';
import { Component, computed, inject, Input, input, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

import {
  AvatarComponent,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  SidebarToggleDirective
} from '@coreui/angular';

import { IconDirective } from '@coreui/icons-angular';
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { CajaDiarioService } from '../../../services/caja-diario..service';
import { delay } from 'rxjs/operators';

// --- INTERFAZ PARA CORREGIR EL ERROR TS2339 ---
interface NotificationItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  time: string;
  sucursalId: number | null;
  totalEgresos?: number;
}

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ContainerComponent, 
    HeaderTogglerDirective, 
    SidebarToggleDirective, 
    IconDirective, 
    HeaderNavComponent,
    RouterLink,
    DropdownComponent, 
    DropdownToggleDirective, 
    AvatarComponent, 
    DropdownMenuDirective,
    DropdownItemDirective, 
  ]
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit {
  @Input() sucursalNombre: string = 'Sin Sucursal';
  
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;
  private authService = inject(AuthService);
  private cd = inject(ChangeDetectorRef); // Inyectado para corregir NG0100

  // Propiedades de usuario
  public userName: string = 'Usuario';
  public userRole: string = 'Cobrador';
  public userAvatar: string = './assets/images/avatars/8.jpg'; 
  
  public totalEgresos: number = 0;
  public userId: number | null = null;
  public sucursalId: number | null = null;
  public notificationCount = 0;
  sidebarId = input('sidebar1');

  readonly colorModes = [
    { name: 'light', text: 'Light', icon: 'cilSun' },
    { name: 'dark', text: 'Dark', icon: 'cilMoon' },
    { name: 'auto', text: 'Auto', icon: 'cilContrast' }
  ];

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return this.colorModes.filter(mode => mode.name === currentMode)[0]?.icon ?? 'cilSun';
  });

  public dataSource: NotificationItem[] = [];
 
  constructor(
    private sucursalContextService: SucursalContextService,
    private cajaDiarioService: CajaDiarioService
  ) {
    super();
  }

  ngOnInit(): void {
    this.sucursalId = this.sucursalContextService.getSucursalId();
    this.loadUserData();
    this.notificationCount = 0;
    this.loadBalance();
  }

  private loadUserData(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userName = `${user.nombre || ''} ${user.apellidos || ''}`.trim() || user.email || 'Usuario';
        this.userId = user.usuario_id;
        
        const roleId = user.tipo_usuario || user.rol;
        this.userRole = roleId === 1 ? 'Administrador' : roleId === 2 ? 'Cobrador' : (user.tipoUsuario || 'Personal');
      } catch (error) {
        console.error('Error al leer usuario', error);
      }
    }
  }

  loadBalance(): void {
    if (!this.userId) return;
    
    // Usamos delay(0) para que la actualización ocurra en el siguiente tick de JS
    // y detectChanges() para asegurar que la vista se entere del cambio de 0 -> valor real
    this.cajaDiarioService.getCaja(this.userId)
      .pipe(delay(0)) 
      .subscribe({
        next: (res: any) => { 
          this.totalEgresos = res?.monto_final_esperado || 0;
          this.cd.detectChanges(); // Forzamos la actualización segura
          console.log('Resumen de caja en header:', res);
        },
        error: (err) => {
          if (err.status === 404) {
            this.totalEgresos = 0;
          } else {
            console.error('Error crítico al cargar datos de caja:', err);
          }
          this.cd.detectChanges();
        }
      });
  }

  onLogout(): void {
    this.authService.logout();
  }

  viewNotifications(): void {
    console.log('Ver todas las notificaciones');
  }

  public newMessages = [
    { id: 0, from: 'Sistema', title: 'Mantenimiento', time: 'Just now', message: 'Revisión nocturna...' }
  ];
}