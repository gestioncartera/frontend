import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { SucursalService, Sucursal } from '../../../services/sucursal.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';
import { AuthService } from '../../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
 

@Component({
  selector: 'app-cambio-sucursal',
  templateUrl: './cambio-sucursal.component.html',
  styleUrls: ['./cambio-sucursal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
  ],
})
export class CambioSucursalComponent implements OnInit {
  sucursales: Sucursal[] = [];

  showBackButton = false;
  selectedId: number | null = null;

  constructor(
    public router: Router,
    private sucursalService: SucursalService,
    private sucursalContextService: SucursalContextService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private location: Location
  ) {
    // Obtener sucursal del contexto
    const sucursalActual = this.sucursalContextService.getSucursalActual();
    this.selectedId = sucursalActual ? sucursalActual.id : null;
  }

  ngOnInit(): void {
    this.showBackButton = !!this.sucursalContextService.getSucursalActual();
    this.getSucursales();
  }

  getSucursales() {
    this.sucursalService.getSucursales().subscribe((data: Sucursal[]) => {
      this.sucursales = data;
    });
  }

  changeSucursal() {
    if (!this.selectedId) {
      this.snackBar.open(
        'Por favor seleccione una sucursal antes de cambiar',
        'Cerrar',
        { duration: 3000 }
      );
      return;
    }

    const selected = this.sucursales.find(
      (s) => s.sucursal_id === this.selectedId
    );

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Seleccionar sucursal',
        message: `
          ¿Desea Seleccionar la sucursal
          <b>${selected?.nombre || 'seleccionada'}</b>?
        `,
        confirmText: 'Guardar',
        cancelText: 'Cancelar',
        color: 'primary',
        icon: 'swap_horiz',
        type: 'info'
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.cambiarSucursalConfirmada(selected);
      }
    });
  }

  private cambiarSucursalConfirmada(selected: Sucursal | undefined): void {
    if (this.selectedId && selected) {
      // Guardar sucursal en el contexto
      this.sucursalContextService.setSucursalActual({
        id: this.selectedId,
        nombre: selected.nombre,
        direccion: selected.direccion
      });
      
      // Mantener compatibilidad con código existente
      localStorage.setItem('sucursalId', String(this.selectedId));
      localStorage.setItem('sucursalName', selected.nombre);
      
      this.snackBar.open(
        `Sucursal cambiada a: ${selected.nombre}`,
        'Cerrar',
        { duration: 3000 }
      );
      
      // Determine redirection based on user role
      const esCobrador = this.authService.isCobrador();
      console.log('Usuario es cobrador:', esCobrador);
      if (esCobrador) {
        this.router.navigate(['/cobro/crear-cobro']);
      } else {
        this.router.navigate(['/ruta/list-ruta']);
      }
    }
  }

  goBack(): void {
    this.location.back();
  }
}
