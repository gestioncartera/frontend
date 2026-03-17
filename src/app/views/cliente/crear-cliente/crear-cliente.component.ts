import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService, Cliente } from '../../../services/cliente.service';
import { RutasService, Rutas } from '../../../services/rutas.service'; // Nueva importación
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search'; // Nueva importación
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-crear-cliente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // Agregado
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatDialogModule,
    NgxMatSelectSearchModule, // Agregado
    MatSnackBarModule
  ],
  templateUrl: './crear-cliente.component.html',
  styleUrls: ['./crear-cliente.component.scss'],
})
export class CrearClienteComponent implements OnInit, OnDestroy {
  nombre: string = '';
  apellido: string = '';
  identificacion: string = '';
  telefono: string = '';
  direccion: string = '';
  estado: string = 'ACTIVO';
  rutaId: number = 0;
  clienteId: number | null = null;
  sucursalId: number | null = null;
  isEditMode: boolean = false;

  // Gestión de Rutas (Reactive)
  rutas: Rutas[] = [];
  public rutaCtrl: FormControl<number | null> = new FormControl<number | null>(null);
  public rutaFilterCtrl: FormControl<string | null> = new FormControl<string | null>('');
  public filteredRutas: ReplaySubject<Rutas[]> = new ReplaySubject<Rutas[]>(1);
  protected _onDestroy = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clienteService: ClienteService,
    private rutasService: RutasService, // Inyección del servicio
    private sucursalContextService: SucursalContextService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.cargarRutas();
    
    // Obtener sucursal actual
    this.sucursalContextService.sucursalActual$.subscribe(sucursal => {
      this.sucursalId = sucursal ? sucursal.id : null;
    });

    // Filtro dinámico de rutas
    this.rutaFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))      .subscribe(() => this.filterRutas());

    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.clienteId = Number(params['id']);
        this.isEditMode = true;
        this.cargarCliente(this.clienteId);
      }
    });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  cargarRutas() {
    const idSucursal = this.sucursalContextService.getSucursalId();
    if (!idSucursal) return;
    this.rutasService.getRutas(idSucursal).subscribe({
      next: (data) => {
        this.rutas = data;
        this.filteredRutas.next(this.rutas.slice());
      },
      error: (err) => console.error('Error cargando rutas', err)
    });
  }

  protected filterRutas() {
    if (!this.rutas) return;
    let search = this.rutaFilterCtrl.value;
    if (!search) {
      this.filteredRutas.next(this.rutas.slice());
      return;
    }
    search = search.toLowerCase();
    this.filteredRutas.next(
      this.rutas.filter(ruta => ruta.nombre_ruta.toLowerCase().includes(search!))
    );
  }

  cargarCliente(id: number) {
    this.clienteService.getCliente(id).subscribe({
      next: (cliente) => {
        this.nombre = cliente.nombres;
        this.apellido = cliente.apellidos;
        this.identificacion = cliente.numero_identificacion;
        this.telefono = cliente.telefono;
        this.direccion = cliente.direccion;
        this.estado = cliente.estado;
        this.rutaCtrl.setValue(cliente.id_ruta); // Usar rutaCtrl en lugar de rutaId
      },
      error: (err) => console.error('Error cargando cliente', err)
    });
  }

  guardar() {
    const selectedRutaId = this.rutaCtrl.value; 

    if (!this.nombre || !this.apellido || !this.identificacion || !this.telefono || !this.direccion || !selectedRutaId || !this.sucursalId) {
     this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Campos Incompletos',
        message: 'Por favor, <b>completa todos los campos obligatorios</b> antes de continuar. Asegúrate de haber seleccionado una ruta y que la sucursal esté activa.',
        confirmText: 'Entendido',
        // Ocultamos el cancelar para que parezca una alerta simple de "OK"
        cancelText: '', 
        type: 'warning',
        icon: 'priority_high',
        color: 'primary' 
      }
    });
      return;
    }

    const dialogData: ConfirmDialogData = {
      title: this.isEditMode ? 'Actualizar Cliente' : 'Registrar Cliente',
      message: this.isEditMode 
        ? '¿Está seguro que desea actualizar los datos de este cliente?' 
        : '¿Está seguro que desea registrar este nuevo cliente?',
      confirmText: this.isEditMode ? 'Actualizar' : 'Registrar',
      cancelText: 'Cancelar',
      color: 'primary',
      type: this.isEditMode ? 'info' : 'success'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.procesarGuardado(selectedRutaId);
      }
    });
  }

  private procesarGuardado(selectedRutaId: number) {
    const clienteData: Partial<Cliente> = {
      nombres: this.nombre,
      apellidos: this.apellido,
      numero_identificacion: this.identificacion,
      telefono: this.telefono,
      direccion: this.direccion,
      estado: this.estado,
      id_ruta: selectedRutaId,
      sucursal_id: this.sucursalId!
    };

    if (this.isEditMode && this.clienteId) {
      this.clienteService.updateCliente(this.clienteId, clienteData).subscribe({
        next: () => {
          // window.alert('¡Cliente actualizado exitosamente!');
          this.cancelar();
        },
        error: (err) => {
          console.error('Error actualizando cliente', err);
          window.alert('Error al actualizar cliente');
        }
      });
    } else {
        console.log('Datos a enviar para creación:', clienteData);
      this.clienteService.createCliente(this.sucursalId!, clienteData).subscribe({
        next: () => {
          // window.alert('¡Cliente creado exitosamente!');
          this.cancelar();
        },
        error: (err) => {
          console.error('Error creando cliente', err);
          window.alert('Error al crear cliente');
        }
      });
    }
  }

  eliminar() {
    if (!this.clienteId) return;

    const dialogData: ConfirmDialogData = {
      title: 'Eliminar Cliente',
      message: '¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      color: 'warn',
      type: 'error'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clienteService.deleteCliente(this.clienteId!).subscribe({
          next: () => {
            // window.alert('Cliente eliminado exitosamente');
            this.cancelar();
          },
          error: (err) => {
            console.error('Error eliminando cliente', err);
            window.alert('Error al eliminar cliente');
          }
        });
      }
    });
  }

  cancelar() {
    this.router.navigate(['/cliente']);
  }
}