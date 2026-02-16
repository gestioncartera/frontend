import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule,MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ClienteService } from '../../../services/cliente.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';

@Component({
  selector: 'app-modal-cliente',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './modal-cliente.component.html',
  styleUrls: ['./modal-cliente.component.scss']
})
export class ModalClienteComponent implements OnInit {
  clientesTotales: any[] = [];
  clientesFiltrados: any[] = [];
  idRutaRecibida: number;

  constructor(
    private clienteService: ClienteService,
    private dialogRef: MatDialogRef<ModalClienteComponent>,
    private sucursalContextService: SucursalContextService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idRutaRecibida = this.data.id_ruta;
  }

  ngOnInit() {
    console.log('Trabajando con la ruta:', this.idRutaRecibida);
    const idSucursal = this.sucursalContextService.getSucursalId();
    if (!idSucursal) return;
    this.clienteService.getClientesByRuta(this.idRutaRecibida).subscribe(data => {
      this.clientesTotales = data;
      this.clientesFiltrados = data;
    });
  }

  filtrarClientes(event: any) {
    const busqueda = event.target.value.toLowerCase();
    this.clientesFiltrados = this.clientesTotales.filter(c => 
      (c.nombres && c.nombres.toLowerCase().includes(busqueda)) || 
      (c.dni && c.dni.includes(busqueda))
    );
  }

  seleccionar(cliente: any) {
    // Al cerrar el modal, devolvemos el cliente seleccionado al componente de la Ruta
    this.dialogRef.close(cliente);
  }
}