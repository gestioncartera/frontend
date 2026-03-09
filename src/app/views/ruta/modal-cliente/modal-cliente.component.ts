import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule,MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms'; // 👈 Agregamos esto para el [(ngModel)]

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
    MatIconModule,
    FormsModule,
  ],
  templateUrl: './modal-cliente.component.html',
  styleUrls: ['./modal-cliente.component.scss']
})
export class ModalClienteComponent implements OnInit {
 nuevaPosicion: number;

  constructor(
    public dialogRef: MatDialogRef<ModalClienteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { nombre: string, posicion: number }
  ) {
    // Inicializamos con la posición que viene del componente principal
    this.nuevaPosicion = data.posicion;
  }
  ngOnInit(): void {
    // Aquí podrías cargar datos adicionales si fuera necesario
  }

  onCancelar(): void {
    this.dialogRef.close();
  }

  onConfirmar(): void {
    if (this.nuevaPosicion > 0) {
      this.dialogRef.close(this.nuevaPosicion);
    }
  }

}