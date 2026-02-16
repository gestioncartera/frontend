import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { DragDropModule, moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ModalClienteComponent } from '../modal-cliente/modal-cliente.component';
import { RutasService } from '../../../services/rutas.service';
import { ActivatedRoute } from '@angular/router';
import { Cliente, ClienteService } from '../../../services/cliente.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';
@Component({
  selector: 'app-asignar-ruta',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatButtonModule, MatIconModule, MatMenuModule, MatProgressSpinnerModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './asignar-ruta.component.html',
  styleUrls: ['./asignar-ruta.component.scss']
})
export class AsignarRutaComponent {
  nombreRuta = 'Centro Histórico';
  clientesAsignados: any[] = []; // Aquí cargas tus 100 clientes
  ordenModificado = false;
  idRutaActual!: number;
  loading = false;
  listaRutas: any[] = [];
  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private clienteService: ClienteService,
    private route: ActivatedRoute,
    private sucursalContextService: SucursalContextService,
    private rutasService: RutasService
  ) {}

  ngOnInit() {
    this.cargarListaDeRutas();
    // Obtenemos el ID de la ruta desde los parámetros de la URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idRutaActual = Number(id);
       
    }
  }

  //Asignar orden de clientes a la ruta

  cargarListaDeRutas(): void {
    // Asumiendo que getRutas() es el método en tu servicio para el SELECT
    const idSucursal = this.sucursalContextService.getSucursalId(); 
   if (idSucursal !== null) {
    this.rutasService.getRutas(idSucursal).subscribe({
      next: (data: any) => {
        this.listaRutas = data;
      },
      error: (err: any) => {
        console.error('Error al cargar rutas:', err);
        this.snackBar.open('Error al obtener la lista de rutas', 'Cerrar');
      }
    });
    }  
  }
  onRutaChange(idRuta: number): void {
    if (!idRuta) return;
    
    this.idRutaActual = idRuta;
    this.ordenModificado = false; // Reset de cambios al cambiar de ruta
    this.abrirModalClientes();
    console.log('Ruta seleccionada:', this.idRutaActual);
  }

  // Maneja el arrastre visual
  onDrop(event: CdkDragDrop<string[]>) {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.clientesAsignados, event.previousIndex, event.currentIndex);
      this.ordenModificado = true;
    }
  }

  abrirModalClientes() {
    if (!this.idRutaActual) {
    this.snackBar.open('Por favor, selecciona una ruta primero', 'OK', { duration: 3000 });
    return;
  }
    const dialogRef = this.dialog.open(ModalClienteComponent, {
      width: '450px',
      maxHeight: '90vh',
      data: { id_ruta: this.idRutaActual }
    });

    dialogRef.afterClosed().subscribe(clienteSeleccionado => {
      if (clienteSeleccionado) {
        // Verificar si ya existe en la lista para evitar duplicados
        const existe = this.clientesAsignados.some(c => c.cliente_id === clienteSeleccionado.cliente_id);
        
        if (!existe) {
          this.clientesAsignados.push(clienteSeleccionado);
          this.ordenModificado = true;
          this.snackBar.open(`${clienteSeleccionado.nombres} añadido a la ruta`, 'OK', { duration: 3000 });
        } else {
          this.snackBar.open('Este cliente ya está en la ruta', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  // Maneja el movimiento directo (Opción 1)
  moverAPosicion(indexActual: number) {
    const promptValue = prompt(`Mover a "${this.clientesAsignados[indexActual].nombres}" a la posición:`, (indexActual + 1).toString());
    
    if (promptValue) {
      const nuevaPos = parseInt(promptValue, 10) - 1;

      if (isNaN(nuevaPos) || nuevaPos < 0 || nuevaPos >= this.clientesAsignados.length) {
        this.snackBar.open('Posición inválida', 'Cerrar', { duration: 3000 });
        return;
      }

      moveItemInArray(this.clientesAsignados, indexActual, nuevaPos);
      this.ordenModificado = true;
      this.snackBar.open(`Cliente movido a la posición ${nuevaPos + 1}`, 'OK', { duration: 2000 });
    }
  }

  quitarDeRuta(index: number) {
    const cliente = this.clientesAsignados[index];
    if (confirm(`¿Quitar a ${cliente.nombres} de esta ruta?`)) {
      this.clientesAsignados.splice(index, 1);
      this.ordenModificado = true;
      this.snackBar.open('Cliente removido', 'Deshacer', { duration: 3000 }).onAction().subscribe(() => {
        this.clientesAsignados.splice(index, 0, cliente);
      });
    }
  }

 guardarOrden() {
    if (this.clientesAsignados.length === 0) {
      this.snackBar.open('No hay clientes en la ruta para guardar', 'Cerrar');
      return;
    }

    // Preparamos solo el array de objetos con el nuevo orden
    const payload = this.clientesAsignados.map((cliente, index) => ({
      cliente_id: cliente.cliente_id,
      nuevo_orden: index + 1 // El orden visual para el cobrador
    }));
 

    this.loading = true;
    this.clienteService.actualizarOrdenClientes(this.idRutaActual, payload).subscribe({
      next: () => {
        this.ordenModificado = false;
        this.loading = false;
        this.snackBar.open('¡Ruta organizada correctamente!', 'Éxito', { duration: 3000 });
      },

      error: (err: any) => {
        console.error(err);
        this.loading = false;
        console.error('Error al guardar el nuevo orden:', payload);
        console.log('Payload enviado:', JSON.stringify(payload));
        this.snackBar.open('Error al guardar los cambios', 'Reintentar');
      }
    });
  }

/*
  quitarDeRuta(index: number): void {
  const cliente = this.clientesAsignados[index];
  
  // Opcional: Confirmación antes de eliminar
  if (confirm(`¿Estás seguro de quitar a ${cliente.nombres} de esta ruta?`)) {
    // Eliminamos el elemento del array
    this.clientesAsignados.splice(index, 1);
    
    // Marcamos que el orden ha cambiado para habilitar el botón "Guardar"
    this.ordenModificado = true;
    
    this.snackBar.open('Cliente removido de la ruta', 'OK', {
      duration: 3000
    });
  }
}*/

}