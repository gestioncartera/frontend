import { NgIf, CommonModule } from '@angular/common';
import { Component, computed, inject, Input, input, OnInit } from '@angular/core';
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
import { Validators } from '@angular/forms';
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { CajaDiarioService } from '../../../services/caja-diario..service';

// --- INTERFAZ PARA CORREGIR EL ERROR TS2339 ---
interface NotificationItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  time: string;
  sucursalId: number | null ;// Agregado para evitar error de propiedad no encontrada
  totalEgresos?: number; // Agregado para evitar error de propiedad no encontrada
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
    //NavItemComponent,
    //NavLinkDirective, 
    RouterLink,
    //RouterLinkActive,
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
  
  // Propiedades de usuario
  public userName: string = 'Usuario';
  public userRole: string = 'Cobrador';
  public userAvatar: string = './assets/images/avatars/8.jpg'; 
  
  public totalEgresos: number = 0;
  public userId: number | null = null;
  public sucursalId: number | null = null;
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
    return this.colorModes.filter(mode => mode.name === currentMode)[0]?.icon ?? 'cilSun';
  });

  // --- ARREGLO DE NOTIFICACIONES CORREGIDO ---
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
    this.notificationCount =0;// this.newNotifications.length;
    this.loadBalance();
  }

  private loadUserData(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userName = user.nombre + ' ' + user.apellidos || user.nombre || user.email || 'Usuario';
        this.userId = user.usuario_id;
        
        const roleId = user.tipo_usuario || user.rol;
        if (roleId === 1) {
          this.userRole = 'Administrador';
        } else if (roleId === 2) {
          this.userRole = 'Cobrador';
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

  loadBalance(): void {
  if (!this.userId) {
    console.warn('No hay userId disponible para cargar el balance.');
    return;
  }
  
  this.cajaDiarioService.getCaja(this.userId).subscribe({
    next: (res: any) => { 
      this.totalEgresos = res?.monto_final_esperado || 0;
     // this.monto_final_esperado = res?.monto_actual || res?.saldo_disponible || 0;
      
      console.log('Resumen de caja en header:', res);
    },
    error: (err) => {
      if (err.status === 404) {
        // El usuario no tiene caja abierta hoy: valores en cero
        this.totalEgresos = 0;
        //this.monto_final_esperado = 0;
      } else {
        console.error('Error crítico al cargar datos de caja:', err);
      }
    }
  });
}
  

  // Se mantienen para compatibilidad si los usas en otras partes
  public newMessages = [
    { id: 0, from: 'Sistema', title: 'Mantenimiento', time: 'Just now', message: 'Revisión nocturna...' }
  ];
}