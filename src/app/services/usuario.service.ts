import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  usuario_id?: number;
  sucursal_id?: number;
  nombres: string;
  apellidos: string;
  dni?: string;
  telefono?: string;
  email?: string;
  tipo_usuario: number;
  tipoUsuarioNombre?: string;
  estado?: string;
  created_at?: Date;
}
 

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuario`;

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios
  getUsuarios(idSucursal: number | string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/getUsuarios/${idSucursal}`);
  }

  // Obtener usuario por ID
  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/getUsuarioById/${id}`);
  }

  // Crear usuario
  createUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/createUsuario`, usuario);
  }

  // Actualizar usuario
  updateUsuario(id: number, usuario: Usuario): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/updateUsuario/${id}`, usuario);
  }

  // Eliminar usuario
  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Cambiar estado de usuario
  cambiarEstado(id: number, estado: string): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/estado`, { estado });
  }
  /**
 * Obtiene el listado de cobradores activos para una sucursal específica.
 * Basado en el endpoint: /api/usuario/getCobradoresActivos/{idSucursal}
 * @param idSucursal ID de la sucursal enviado por la URL
 */
getCobradoresActivos(idSucursal: number | string): Observable<Usuario[]> {
  const url = `${this.apiUrl}/getCobradoresActivos/${idSucursal}`;
  
  return this.http.get<Usuario[]>(url).pipe(
    // Opcional: Procesar los nombres para que sea más fácil mostrarlos en el HTML
    map(usuarios => usuarios.map(u => ({
      ...u,
      nombre_completo: `${u.nombres} ${u.apellidos}`
    })))
  );
}
}
