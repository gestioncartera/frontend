import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox'; 
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TipoPrestamo, TipoPrestamoService } from '../../../services/tipoPrestamo.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';


@Component({
  selector: 'app-tipo-prestamo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './tipo-prestamo.component.html',
  styleUrls: ['./tipo-prestamo.component.scss']
})
export class TipoPrestamoComponent implements OnInit {

  cantidadCuotas: number | null = null;
  porcentaje: number | null = null;  
  isEditing = false;
  editingId: number | null = null;
  incluyeDomingos: boolean = false;
  diasGracia: number = 0;
  frecuencia: string = 'DIARIO';
  nombrePlan: string = '';
  constructor(
    private tipoPrestamoService: TipoPrestamoService,
    private router: Router,
    private route: ActivatedRoute, // Para obtener el ID si estamos editando
    private snackBar: MatSnackBar,
     private sucursalContextService: SucursalContextService,
  ) { }

  ngOnInit(): void {
    // Verificar si estamos en modo edición
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const idNum = id !== null ? +id : NaN;
      if (id && !isNaN(idNum)) {
        this.isEditing = true;
        this.editingId = idNum;
        this.loadTipoPrestamo(this.editingId);
      } else if (id && isNaN(idNum)) {
        console.warn('ID de tipo de préstamo inválido:', id);
        this.snackBar.open('ID de tipo de préstamo inválido.', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/prestamo/list-tipo']);
      }
    });
  }

  loadTipoPrestamo(id: number): void {
    console.log('Cargando tipo de préstamo con ID:', id);
    this.tipoPrestamoService.getTipoPrestamoById(id).subscribe({
      next: (tipo) => {
        this.cantidadCuotas = tipo.cantidad_cuotas;
        this.porcentaje = tipo.porcentaje;
        this.nombrePlan = tipo.nombre || '';
        this.frecuencia = tipo.frecuencia || 'DIARIO';
      },
      error: (err: any) => {
        console.error('Error al cargar tipo de préstamo:', err);
        this.snackBar.open('No se pudo cargar la información del tipo de préstamo.', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/prestamo/list-tipo']); // Redirigir si hay error
      }
    });
  }

  guardar(): void {
    if (this.cantidadCuotas === null || this.porcentaje === null) {
      this.snackBar.open('Por favor, completa todos los campos.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['warning-snackbar']
      });
      return;
    }

       const tipoPrestamoData = {
    cantidad_cuotas: Number(this.cantidadCuotas),
    porcentaje: Number(this.porcentaje),
    sucursal_id: this.sucursalContextService.getSucursalId(),
    // porque tu backend hace: tipoPrestamo.nombre
    nombre: this.nombrePlan 
  };

    if (this.isEditing && this.editingId) {
      console.log('Actualizando tipo de préstamo con ID:', this.editingId);
      console.log('Datos a actualizar:', tipoPrestamoData);
      this.tipoPrestamoService.updateTipoPrestamo(this.editingId, tipoPrestamoData).subscribe({
        next: (res) => {
          this.snackBar.open('¡Tipo de préstamo actualizado exitosamente!', 'Cerrar', {
             duration: 3000,
             horizontalPosition: 'end',
             verticalPosition: 'top',
             panelClass: ['success-snackbar']
          });
          this.cancelar();
        },
       error: (err: any) => {
          console.error('Error al actualizar tipo de préstamo:', err);
          this.snackBar.open('Error al actualizar el tipo de préstamo.', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
       const idSucursal = this.sucursalContextService.getSucursalId();
    if (!idSucursal) return;
       this.tipoPrestamoService.createTipoPrestamo(idSucursal, tipoPrestamoData).subscribe({
        next: (res: TipoPrestamo) => {
          console.log('Datos a actualizar:', tipoPrestamoData);
          this.snackBar.open('Configuración guardada exitosamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          });
          this.cancelar();
          
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error de servidor:', err.status);
          this.snackBar.open('No se pudo crear el tipo de préstamo', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/prestamo/list-tipo']); // Navegar a la lista de tipos de préstamo
  }

  get totalEjemplo() {
  const montoBase = 1000000;
  // Si this.porcentaje es null o undefined, usa 0
  const porcentajeSeguro = this.porcentaje ?? 0;
  const interes = (porcentajeSeguro / 100) * montoBase;
  return montoBase + interes;
}

get valorCuotaEjemplo() {
  // Si cantidadCuotas es nulo, indefinido o 0, el resultado es 0
  if (!this.cantidadCuotas || this.cantidadCuotas === 0) {
    return 0;
  }
  return this.totalEjemplo / this.cantidadCuotas;
}
}