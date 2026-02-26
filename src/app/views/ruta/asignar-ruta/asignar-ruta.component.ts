import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DragDropModule, moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

// Servicios y Componentes
import { ModalClienteComponent } from '../modal-cliente/modal-cliente.component';
import { RutasService } from '../../../services/rutas.service';
import { ClienteService } from '../../../services/cliente.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';

@Component({
  selector: 'app-asignar-ruta',
  standalone: true,
  imports: [
    CommonModule, 
    DragDropModule, 
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule, 
    MatProgressSpinnerModule, 
    MatFormFieldModule, 
    MatSelectModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './asignar-ruta.component.html',
  styleUrls: ['./asignar-ruta.component.scss']
})
export class AsignarRutaComponent implements OnInit {
  nombreRuta: string = 'Seleccione una ruta';
  clientesAsignados: any[] = [];
  listaRutas: any[] = [];
  
  idRutaActual!: number;
  loading: boolean = false;
  ordenModificado: boolean = false;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private clienteService: ClienteService,
    private rutasService: RutasService,
    private route: ActivatedRoute,
    private sucursalContextService: SucursalContextService
  ) {}

  ngOnInit(): void {
    this.cargarListaDeRutas();
    
    // Si viene un ID por URL (ej. /asignar-ruta/5), lo cargamos automáticamente
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idRutaActual = Number(idParam);
      // Esperamos un momento a que las rutas carguen para setear el nombre
      setTimeout(() => this.onRutaChange(this.idRutaActual), 500);
    }
  }

  cargarListaDeRutas(): void {
    const idSucursal = this.sucursalContextService.getSucursalId(); 
    if (idSucursal) {
      this.rutasService.getRutas(idSucursal).subscribe({
        next: (data) => this.listaRutas = data,
        error: () => this.mostrarError('Error al obtener la lista de rutas')
      });
    }
  }

  onRutaChange(idRuta: number): void {
    if (!idRuta) return;
    
    this.idRutaActual = idRuta;
    const rutaObj = this.listaRutas.find(r => r.ruta_id === idRuta);
    this.nombreRuta = rutaObj ? rutaObj.nombre_ruta : 'Ruta seleccionada';
    
    this.ordenModificado = false;
    this.cargarClientesDeLaRuta(idRuta);
  }

  cargarClientesDeLaRuta(idRuta: number): void {
    this.loading = true;
    this.clientesAsignados = [];

    this.clienteService.getClientesByRuta(idRuta).subscribe({
      next: (clientes) => {
        // Ordenamos por la propiedad 'orden' que viene del backend
        this.clientesAsignados = clientes.sort((a, b) => (a.orden || 0) - (b.orden || 0));
        this.loading = false;
      },
      error: (err:any) => {
        this.loading = false;
        const msg = err.error?.message || 'Error al cargar los clientes de esta ruta';
        this.mostrarError(msg);
      }
    });
  }

  onDrop(event: CdkDragDrop<string[]>) {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.clientesAsignados, event.previousIndex, event.currentIndex);
      this.ordenModificado = true;
    }
  }

  guardarOrden() {
    this.loading = true;
    const payload = this.clientesAsignados.map((cliente, index) => ({
      cliente_id: cliente.cliente_id,
      nuevo_orden: index + 1
    }));

    this.clienteService.actualizarOrdenClientes(this.idRutaActual, payload).subscribe({
      next: () => {
        this.loading = false;
        this.ordenModificado = false;
        this.snackBar.open('¡Orden actualizado correctamente!', 'Éxito', { duration: 3000 });
      },
      error: (err) => {
        this.loading = false;
        this.mostrarError(err.error?.message || 'No se pudo guardar el nuevo orden');
      }
    });
  }

  abrirModalClientes() {
    const dialogRef = this.dialog.open(ModalClienteComponent, {
      width: '450px',
      data: { id_ruta: this.idRutaActual }
    });

    dialogRef.afterClosed().subscribe(cliente => {
      if (cliente) {
        if (!this.clientesAsignados.some(c => c.cliente_id === cliente.cliente_id)) {
          this.clientesAsignados.push(cliente);
          this.ordenModificado = true;
        }
      }
    });
  }

  moverAPosicion(indexActual: number) {
    const promptValue = prompt(`Mover a "${this.clientesAsignados[indexActual].nombres}" a la posición:`, (indexActual + 1).toString());
    if (promptValue) {
      const nuevaPos = parseInt(promptValue, 10) - 1;
      if (nuevaPos >= 0 && nuevaPos < this.clientesAsignados.length) {
        moveItemInArray(this.clientesAsignados, indexActual, nuevaPos);
        this.ordenModificado = true;
      }
    }
  }   
    
   

  private mostrarError(msg: string) {
    this.snackBar.open(msg, 'Cerrar ', { duration: 5000, panelClass: ['error-snackbar'] });
  }
}