import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { MatPaginatorModule } from '@angular/material/paginator'; // 1. Importa el módulo
import {
  ContainerComponent,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective
} from '@coreui/angular';

import { DefaultFooterComponent, DefaultHeaderComponent } from './';
import { navItems } from './_nav';
import { AuthService } from '../../services/auth.service';
import { IconSetService } from '@coreui/icons-angular';

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss', './logo-constrained.css'],
  standalone: true,
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    ContainerComponent,
    DefaultFooterComponent,
    DefaultHeaderComponent,
    NgScrollbar,
    RouterOutlet,
    RouterLink,
    ShadowOnScrollDirective
  ],
})
export class DefaultLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  public navItems = this.getFilteredNavItems();
  constructor() {}

  ngOnInit(): void {
    const isCobrador = this.authService.isCobrador();
    // Si el usuario es Cobrador (rol 2) y es redirigido al dashboard,
    // lo enviamos directamente a la página de creación de cobros.
    console.log('¿Es Cobrador en DefaultLayoutComponent?:', isCobrador);
    if (isCobrador && this.router.url.includes('/dashboard')) {
      this.router.navigate(['/cobro/crear-cobro']);
    }
  }

  private getFilteredNavItems() {
    if (this.authService.isCobrador()) {
      // Cobradores ven cambio de sucursal y registro de cobro
      return [
        {
          name: 'Cambio de Sucursal',
          url: '/cambio-sucursal',
          iconComponent: { name: 'cil-settings' },
        },
        {
          name: 'Cobros',
          url: '/cobro',
          iconComponent: { name: 'cil-bell' },
          children: [
            {
              name: 'Registro Cobro',
              url: '/cobro/crear-cobro',
              icon: 'nav-icon-bullet',
            }
          ]
        },
        {
          name: 'Caja',
          url: '/caja',
          iconComponent: { name: 'cil-money' },
          children: [
            {
              name: 'Cierre de Caja',
              url: '/caja/cierre-caja',
              icon: 'nav-icon-bullet',
            },
          ],
        },
        {
    name: 'Préstamos',
    url: '/prestamo',
    iconComponent: { name: 'cil-chart-pie' },
    children: [      
      {
        name: 'Crear Préstamo',
        url: '/prestamo/crear-prestamo',
        icon: 'nav-icon-bullet',
      },
       
     
       ],
       }, 
      ];
    }
    console.log('Usuario no es cobrador, mostrando menú de admin.');
    // Admin ve todo el menú
    return [...navItems];
  }
}
