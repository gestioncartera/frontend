import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Home',
    title: true,
  },
  {
    name: 'Cambio de Sucursal',
    url: '/cambio-sucursal',
    iconComponent: { name: 'cil-settings' },
  },
   
 
   {
    name: 'Sucursales',
    url: '/sucursal',
    iconComponent: { name: 'cil-home' },
    children: [
      {
        name: 'List Sucursal',
        url: '/sucursal/list-sucursal',
        icon: 'nav-icon-bullet',
      },
    ],
  }, 
   {
    name: 'Caja',
    url: '/gasto',
    iconComponent: { name: 'cil-calculator' },
    children: [
       /*{
        name: 'Abrir Caja',
        url: '/caja/abrir-caja',
        icon: 'nav-icon-bullet',
      },*/ 
      {
        name: 'Movimientos Sucursal',
        url: '/gasto/list-gasto',
        icon: 'nav-icon-bullet',
      }, 
      {
        name: 'Movimientos Diarios',
        url: '/gasto/registro-egreso-diario',
        icon: 'nav-icon-bullet',
      },
       {
        name: 'Cierre de Caja',
        url: '/caja/cerrar-caja',
        icon: 'nav-icon-bullet',
      },
     
     
       /*
      {
        name: 'Crear Gasto',
        url: '/gasto/crear-gasto',
        icon: 'nav-icon-bullet',
      }
     
      {
        name: 'Registrar Egreso',
        url: '/gasto/registro-egreso-suc',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Registro Egreso Diario',
        url: '/gasto/registro-egreso-diario',
        icon: 'nav-icon-bullet',
      },  */
    ],
  },

  {
      name: 'Rutas',
      url: '/ruta',
      iconComponent: { name: 'cil-puzzle' },
      children: [
        {
          name: 'Gestión de Rutas',
          url: '/ruta/list-ruta',
          icon: 'nav-icon-bullet',
        },
        {
          name: 'Crear Ruta',
          url: '/ruta/crear-ruta',
          icon: 'nav-icon-bullet',
        },
        {
          name: 'Ordenar Ruta',
          url: '/ruta/asignar-ruta',
          icon: 'nav-icon-bullet',
        },
      ],
  },
 
  {
    name: 'Préstamos',
    url: '/prestamo',
    iconComponent: { name: 'cil-wallet' },
    children: [
       {
        name: 'Tipo de Préstamo',
        url: '/prestamo/list-tipo',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Crear Préstamo',
        url: '/prestamo/crear-prestamo',
        icon: 'nav-icon-bullet',
      }, 
      {
        name: 'Gestión de Préstamos',
        url: '/prestamo',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Aprobar Préstamos',
        url: '/prestamo/aprobar-prestamo',
        icon: 'nav-icon-bullet',
      },
      
      
     
    ],
  },
     
  {
    name: 'Cobros',
    url: '/cobro',
    iconComponent: { name: 'cil-check-circle' },
    children: [
      {
        name: 'Gestión de Cobros',
        url: '/cobro/seleccionar-ruta',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Registro Cobro',
        url: '/cobro/crear-cobro',
        icon: 'nav-icon-bullet',
      },

        
      
    ],
  },
  {
    name: 'Reportes',
    url: '/reportes',
    iconComponent: { name: 'cil-chart-pie' },
    children: [
      {
        name: 'General',
        url: '/reportes/reporte1',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Prestamos',
        url: '/reportes/reporte2',
        icon: 'nav-icon-bullet',
      },
    ],
  },
/*
  {
    name: 'Periodo',
    url: '/periodo',
    iconComponent: { name: 'cil-cursor' },
    children: [
      {
        name: 'Crear',
        url: '/periodo/crear-periodo',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Aportes',
        url: '/periodo/list-periodo',
        icon: 'nav-icon-bullet',
      },
    ],
  },
*/
  {
    name: 'Clientes',
    url: '/cliente',
    iconComponent: { name: 'cil-people' },
    children: [
      {
        name: 'Gestión de Clientes',
        url: '/cliente/list-cliente',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Crear Cliente',
        url: '/cliente/crear-cliente',
        icon: 'nav-icon-bullet',
      },
    ],
  },
  
 
 
  {
    title: true,
    name: 'Configuración',
  },
  {
    name: 'Usuarios',
    url: '/usuario',
    iconComponent: { name: 'cil-people' },
    children: [
      {
        name: 'Listado de Usuarios',
        url: '/usuario/list',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Crear Usuario',
        url: '/usuario/crear',
        icon: 'nav-icon-bullet',
      },
    ],
  },
  /*
  {
    name: 'Autenticación',
    url: '/login',
    iconComponent: { name: 'cil-lock-locked' },
    children: [
      {
        name: 'Iniciar Sesión',
        url: '/login',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Registro',
        url: '/register',
        icon: 'nav-icon-bullet',
      },
    ],
  },
  */
];
