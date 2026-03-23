import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select'; 
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClienteService,  Cliente } from '../../../services/cliente.service';
import { ReplaySubject, Subject, Observable } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { Prestamos, PrestamoService } from '../../../services/prestamo.service';
import { TipoPrestamo, TipoPrestamoService } from '../../../services/tipoPrestamo.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { Usuario } from '../../../services/usuario.service';
@Component({
  selector: 'app-crear-prestamo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    NgxMatSelectSearchModule,
    MatSnackBarModule
  ],
  templateUrl: './crear-prestamo.component.html',
  styleUrls: ['./crear-prestamo.component.scss'],
})
export class CrearPrestamoComponent implements OnInit, OnDestroy {
  clienteSeleccionado: Cliente | null = null;
  periodoSeleccionado: any;
  valor: number = 0;
  fecha: Date = new Date(); // Fecha actual del sistema
  estado: string = 'ACTIVO';
  saldoPendiente: number = 0;

  clientes: Cliente[] = [];
  tiposPrestamo: TipoPrestamo[] = [];
  selectedTipoPrestamo: TipoPrestamo | null = null;
  iscobrador: boolean = false;
  periodos: any[] = [];
  isEditing = false;
  editingId: number | null = null;
  tipoPrestamo: string = 'DIARIO'; // Mantener por compatibilidad si es necesario, o eliminar
 ruta_id: number | null = null; // Para filtrar clientes por ruta si es necesario
  public clienteFilterCtrl: FormControl<string | null> = new FormControl<string | null>('');
  public filteredClientes: ReplaySubject<Cliente[]> = new ReplaySubject<Cliente[]>(1);
  protected _onDestroy = new Subject<void>();

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private clienteService: ClienteService,
    private prestamoService: PrestamoService,
    private tipoPrestamoService: TipoPrestamoService,
    private sucursalContextService: SucursalContextService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.iscobrador  = this.authService.isCobrador();
    this.cargarClientes();
    this.cargarTiposPrestamo();
    this.periodos = JSON.parse(localStorage.getItem('periodos') || '[]');
     


    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        // Lógica de edición
        this.isEditing = true;
        this.editingId = Number(params['id']);
        this.loadPrestamoForEdit(this.editingId);
      }
    });

    this.clienteFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterClientes();
      });
  }

  cargarClientes() {
    const user = this.authService.getCurrentUserValue();
    const idSucursal = this.sucursalContextService.getSucursalId();

    if (!idSucursal) {
      this.snackBar.open('No se ha seleccionado una sucursal.', 'Cerrar', { duration: 3000 });
      return;
    }

    let clientesObservable: Observable<Cliente[]>;
    console.log('cobrador:', this.iscobrador);
    if (this.iscobrador) {
     
      const userId = user?.usuario_id || (user as any)?.usuario_id;
      if (!userId) {
        console.error('ID de usuario cobrador no encontrado.');
        this.snackBar.open('No se pudo identificar al cobrador.', 'Cerrar', { duration: 3000 });
        return;
      }
      clientesObservable = this.clienteService.getClientesRutaUser(userId);
      console.log('Cargando clientes para el usuario ID:', idSucursal, user);
    } else {
      clientesObservable = this.clienteService.getClientes(idSucursal);
      //clientesObservable = this.clienteService.getClientes(idSucursal);
      console.log('Cargando clientes para sucursal ID:', idSucursal,user);
    }
    

    clientesObservable.subscribe({
      next: (data) => {
        this.clientes = data;
        this.filteredClientes.next(this.clientes.slice());
        console.log('Clientes cargados:', this.clientes);
      },
      error: (err) => {
        const mensaje = err.error?.message || 'Error al cargar los clientes.';
        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        console.error('Error cargando clientes', err);
      }
    });
  }

  cargarTiposPrestamo() {
    const idSucursal = this.sucursalContextService.getSucursalId();
    if (!idSucursal) return;
    this.tipoPrestamoService.getTiposPrestamo(idSucursal).subscribe({
      next: (data) => {
        this.tiposPrestamo = data;
        console.log('Tipos de préstamo cargados:', data); // Debug para verificar estructura
      },
      error: (err) => console.error('Error cargando tipos de préstamo', err)
    });
  }

  protected filterClientes() {
    if (!this.clientes) {
      return;
    }
    let search = this.clienteFilterCtrl.value;
    if (!search) {
      this.filteredClientes.next(this.clientes.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredClientes.next(
      this.clientes.filter(cliente => 
        cliente.nombres.toLowerCase().indexOf(search!) > -1 || 
        cliente.apellidos.toLowerCase().indexOf(search!) > -1  
      )
    );
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  loadPrestamoForEdit(id: number) {
    const prestamos = JSON.parse(localStorage.getItem('prestamos') || '[]');
    const prestamo = prestamos.find((p: any) => p.id === id);
    if (prestamo) {
      this.clienteSeleccionado = prestamo.cliente;
      this.periodoSeleccionado = prestamo.periodo;
      this.valor = prestamo.valor;
      this.fecha = new Date(prestamo.fecha);
      this.estado = prestamo.estado;
      this.saldoPendiente = prestamo.saldoPendiente;
    }
  }

crear() {
  if (!this.clienteSeleccionado || !this.valor || !this.selectedTipoPrestamo) {
    window.alert('Completa los campos obligatorios.');
    return;
  }

  // Extraemos el ID explícitamente para evitar el undefined
  // Estrategia robusta para encontrar el ID
  const tipoObj = this.selectedTipoPrestamo as any;
  let tipoId = tipoObj.id_tipo_prestamo || tipoObj.id || tipoObj.Id || tipoObj.tipo_prestamo_id;

  // Si aún no encontramos ID, buscamos cualquier propiedad que parezca un ID
  if (!tipoId) {
      console.warn('ID estándar no encontrado. Buscando alternativas en:', Object.keys(tipoObj));
      const possibleIdKey = Object.keys(tipoObj).find(key => 
          /id/i.test(key) && typeof tipoObj[key] === 'number'
      );
      if (possibleIdKey) {
          tipoId = tipoObj[possibleIdKey];
          console.log(`ID encontrado usando heurística: ${possibleIdKey} -> ${tipoId}`);
      }
  }

  if (!tipoId) {
    console.error('CRITICAL: No se encontró ID en el tipo de préstamo. Objeto completo:', JSON.stringify(this.selectedTipoPrestamo));
    window.alert('Error: El tipo de préstamo seleccionado no tiene un ID válido. Revisa la consola para más detalles.');
    return;
  }
  
  // Calculamos el interés y total aquí para que el log sea real
  const interesCalculado = this.valor * (this.selectedTipoPrestamo.porcentaje / 100);
  const totalConInteres = this.valor + interesCalculado;
  const valorCuotaCalculada = totalConInteres / this.selectedTipoPrestamo.cantidad_cuotas;
const fechaFormateada = this.fecha.toISOString().split('T')[0];

  // Obtener usuario actual de forma robusta (id o usuario_id)
  const user = this.authService.getCurrentUserValue();
  const userId = user?.usuario_id || (user as any)?.usuario_id || 0;

  const datosPrestamo: Partial<Prestamos> = {
    cliente_id: this.clienteSeleccionado.cliente_id, 
     tipo_prestamo_id: tipoId, // <--- AQUÍ SE CORRIGE EL UNDEFINED
    monto_prestamo: Number(this.valor),
    valor_intereses: interesCalculado,
    saldo_pendiente: totalConInteres,
    valor_cuota: valorCuotaCalculada,
    fecha_fin_prestamo: fechaFormateada,
     sucursal_id: this.sucursalContextService.getSucursalId() || undefined, 
    id_usuario_creacion: userId
  };
  console.log( 'usuario', userId) ;

  console.log('%c🚀 Datos Finales a Enviar:', 'color: #10b981; font-weight: bold;');
  console.table(datosPrestamo);

  // Llamada al servicio...
  this.prestamoService.createPrestamo(datosPrestamo).subscribe({
    next: (res: any) => {
      const mensaje = res.message || 'Préstamo creado exitosamente';
      this.snackBar.open(mensaje, 'Aceptar', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    error: (err) => {
      console.error('Error:', err);
      const mensaje = err.message || 'Error al crear el préstamo';
     this.snackBar.open(`⚠️ ${err.message}`, 'Entendido', {
        duration: 3000, 
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      
      });
    }
  });
}
 
  cancelar() {
    this.clienteSeleccionado = null;
    this.periodoSeleccionado = null;
    this.valor = 0;
    this.fecha = new Date();
    this.estado = 'ACTIVO';
    this.saldoPendiente = 0;
    this.isEditing = false;
    this.editingId = null;
    this.router.navigate(['/crear-prestamo']);
  }
 

 

  // Al entrar al campo, si es 0, lo vaciamos para que el usuario escriba limpio
limpiarCero(event: any) {
  if (this.valor === 0) {
    this.valor = null as any; // Usamos null para que el input se vea vacío
  }
}

// Al salir del campo, si no escribió nada, lo devolvemos a 0
validarVacio() {
  if (this.valor === null || this.valor === undefined || (this.valor as any) === '') {
    this.valor = 0;
  }
}
}