import { NgIf, CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

import {
  AvatarComponent,
  BadgeComponent,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  NavItemComponent,
  NavLinkDirective,
  SidebarToggleDirective
} from '@coreui/angular';

import { IconDirective } from '@coreui/icons-angular';

// --- INTERFAZ PARA CORREGIR EL ERROR TS2339 ---
interface NotificationItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  standalone: true,
  imports: [
    NgIf,
    CommonModule,
    ContainerComponent, 
    HeaderTogglerDirective, 
    SidebarToggleDirective, 
    IconDirective, 
    HeaderNavComponent,
    //NavItemComponent,
    //NavLinkDirective, 
    //RouterLink,
    //RouterLinkActive,
    DropdownComponent, 
    DropdownToggleDirective, 
    AvatarComponent, 
    DropdownMenuDirective,
    DropdownHeaderDirective, 
    DropdownItemDirective, 
    BadgeComponent, 
     
  ]
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit {

  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;
  private authService = inject(AuthService);

  // Propiedades de usuario
  public userName: string = 'Usuario';
  public userRole: string = 'Cobrador';
  public userAvatar: string = './assets/images/avatars/8.jpg'; 
  
  public notificationCount = 0;
  sidebarId = input('sidebar1');

  // Configuración de temas
  readonly colorModes = [
    { name: 'light', text: 'Light', icon: 'cilSun' },
    { name: 'dark', text: 'Dark', icon: 'cilMoon' },
    { name: 'auto', text: 'Auto', icon: 'cilContrast' }
  ];

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return this.colorModes.find(mode => mode.name === currentMode)?.icon ?? 'cilSun';
  });

  // --- ARREGLO DE NOTIFICACIONES CORREGIDO ---
  public newNotifications: NotificationItem[] = [
    { 
      id: 0, 
      title: 'Cobro por Aprobar', 
      description: 'Ruta 1: Nuevo pago de $50.00', 
      icon: 'cilMoney', 
      color: 'success',
      time: '2 min'
    },
    { 
      id: 1, 
      title: 'Préstamo Vencido', 
      description: 'Cliente: María Sosa excedió el plazo', 
      icon: 'cilWarning', 
      color: 'danger',
      time: '15 min'
    },
    { 
      id: 2, 
      title: 'Nueva Ruta', 
      description: 'Se te asignó el Sector Centro', 
      icon: 'cilMap', 
      color: 'info',
      time: '1 hora'
    },
    { 
      id: 3, 
      title: 'Cierre de Caja', 
      description: 'Sucursal Norte cerró con éxito', 
      icon: 'cilCheckCircle', 
      color: 'primary',
      time: '2 horas'
    }
  ];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.loadUserData();
    this.notificationCount = this.newNotifications.length;
  }

  private loadUserData(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userName = user.nombres || user.nombre || user.email || 'Usuario';
        
        const roleId = user.tipo_usuario || user.rol;
        if (roleId === 1) {
          this.userRole = 'Administrador';
        } else if (roleId === 2) {
          this.userRole = 'Contador';
        } else {
          this.userRole = user.tipoUsuario || 'Personal';
        }
      } catch (error) {
        console.error('Error al leer usuario', error);
      }
    }
  }

  viewNotifications(): void {
    console.log('Ver todas las notificaciones');
  }

  onLogout(): void {
    this.authService.logout();
  }

  // Se mantienen para compatibilidad si los usas en otras partes
  public newMessages = [
    { id: 0, from: 'Sistema', title: 'Mantenimiento', time: 'Just now', message: 'Revisión nocturna...' }
  ];
}