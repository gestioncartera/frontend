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
import { SucursalContextService } from '../../services/sucursal-context.service';

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
  private sucursalContextService = inject(SucursalContextService);
  
  public navItems = this.getFilteredNavItems(); 
  public sucursalNombre: string = 'Cargando...';

  constructor() {}

  ngOnInit(): void {
    // 1. Suscripción a la sucursal
    this.sucursalContextService.sucursalActual$.subscribe(sucursal => {
      this.sucursalNombre = sucursal ? sucursal.nombre : 'Sin Sucursal';
      console.log('Sucursal actual en DefaultLayoutComponent:', this.sucursalNombre);
    });

   this.router.events.pipe(
     filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.collapseAllMenus(this.navItems, event.urlAfterRedirects);
    });
    

    const isCobrador = this.authService.isCobrador();

    // Redirección por defecto: Si el usuario llega al dashboard o a la raíz,
    // lo enviamos a su página principal correspondiente.
    if (this.router.url.includes('/dashboard') || this.router.url === '/') {
      if (isCobrador) {
        this.router.navigate(['/cobro/crear-cobro']);
      } else {
        // Vista por defecto para Administradores
        this.router.navigate(['/reportes/caja-mayor']);
      }
    }
  }
  private closeInactiveMenus(currentUrl: string) {
  this.navItems.forEach(item => {
    if (item.children) {
      // Si la URL actual no está contenida en los hijos de este grupo, lo cerramos
      const isChildActive = item.children.some((child: any) => currentUrl.includes(child.url));
      if (!isChildActive) {
        item.attributes = { ...item.attributes, expanded: false };
      }
    }
  });
}

private collapseAllMenus(items: any[], currentUrl: string = '') {
  items.forEach(item => {
    if (item.children) {
      const hasActiveChild = item.children.some((child: any) => 
        currentUrl.includes(child.url)
      );

      // Usamos el spread operator para asegurar que Angular vea un cambio de objeto
      item.attributes = { ...item.attributes, expanded: hasActiveChild };

      // Recursividad
      this.collapseAllMenus(item.children, currentUrl);
    }
  });

  // ESTA LÍNEA ES CLAVE: Forzamos a Angular a detectar un cambio de referencia
  this.navItems = [...items];
}

  private getFilteredNavItems() {
    if (this.authService.isCobrador()) {
      // Cobradores ven cambio de sucursal y registro de cobro
      return [
        
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
     {
      name: 'Lista Gasto',
      url: '/gasto/listar-gasto-cobro',
      iconComponent: { name: 'cil-calculator' },    
     },
      
      
      ];
    }
    console.log('Usuario no es cobrador, mostrando menú de admin.');
    // Admin ve todo el menú
    return [...navItems];
  }
}
