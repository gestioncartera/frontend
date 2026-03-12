import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet,NavigationEnd } from '@angular/router';
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
import { filter } from 'rxjs/operators'; 

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
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.collapseAllMenus(this.navItems);
    });
    const isCobrador = this.authService.isCobrador();
    // Si el usuario es Cobrador (rol 2) y es redirigido al dashboard,
    // lo enviamos directamente a la página de creación de cobros.
    console.log('¿Es Cobrador en DefaultLayoutComponent?:', isCobrador);
    if (isCobrador && this.router.url.includes('/dashboard')) {
      this.router.navigate(['/cobro/crear-cobro']);
    }
  }

  private collapseAllMenus(items: any[]) {
    items.forEach(item => {
      if (item.children) {
        item.attributes = { ...item.attributes, expanded: false }; // Forzamos el cierre
        this.collapseAllMenus(item.children); // Aplicamos a sub-niveles si existen
      }
    });
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
          name: 'Registro Cobro',
          url: '/cobro/crear-cobro',
          iconComponent: { name: 'cil-bell' },
           
        },
        
        {
           name: 'Crear Préstamo',
              url: '/prestamo/crear-prestamo',
          iconComponent: { name: 'cil-chart-pie' },
           
       }, 
       {
      name: 'Crear Gasto',
      url: '/gasto/crear-gasto',
      iconComponent: { name: 'cil-calculator' },    
     },
      
      
      ];
    }
    console.log('Usuario no es cobrador, mostrando menú de admin.');
    // Admin ve todo el menú
    return [...navItems];
  }
}
