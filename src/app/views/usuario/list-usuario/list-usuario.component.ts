import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { UsuarioService, Usuario } from '../../../services/usuario.service';
import { SucursalContextService } from '../../../services/sucursal-context.service';

@Component({
  selector: 'app-list-usuario',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './list-usuario.component.html',
  styleUrls: ['./list-usuario.component.scss']
})
export class ListUsuarioComponent implements OnInit {
  usuarios: Usuario[] = [];
  
  // Hemos simplificado las columnas: 
  // 'nombres' ahora contiene el avatar, nombre completo y email.
  displayedColumns: string[] = ['nombres', 'telefono', 'rol', 'estado', 'acciones'];

  constructor(
    private router: Router, 
    private usuarioService: UsuarioService,
    private sucursalContextService: SucursalContextService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    const idSucursal = this.sucursalContextService.getSucursalId(); 
   if (idSucursal !== null) {
    this.usuarioService.getUsuarios(  idSucursal).subscribe({
      next: (data) => {
        this.usuarios = data;
        console.log('Usuarios cargados:', data);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
    }  
  }

  crearUsuario(): void {
    this.router.navigate(['/usuario/crear']);
  }

  editarUsuario(usuario: Usuario): void {
    // Asegúrate de que tu ruta en app.routes.ts acepte el parámetro :id
    this.router.navigate(['/usuario/editar', usuario.usuario_id]);
  }

  verDetalles(usuario: Usuario): void {
    // Podrías navegar a una vista de perfil o abrir un diálogo
    this.router.navigate(['/usuario/detalle', usuario.usuario_id]);
  }

  /**
   * Genera las iniciales para el avatar si no hay foto
   */
  getInitials(usuario: Usuario): string {
    const n = usuario.nombres ? usuario.nombres[0] : '';
    const a = usuario.apellidos ? usuario.apellidos[0] : '';
    return (n + a).toUpperCase();
  }
}