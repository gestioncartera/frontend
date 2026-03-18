import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TipoPrestamo { 
  id_tipo_prestamo?: number;
  cantidad_cuotas: number;
  porcentaje: number;
  nombre?: string;
  frecuencia?: string; 
  created_at?: string;
}

// Omitimos el ID para la creación
export type TipoPrestamoRequest = Omit<TipoPrestamo, 'id_tipo_prestamo' | 'created_at'>;

@Injectable({
  providedIn: 'root'
})
export class TipoPrestamoService {
  private apiUrl = `${environment.apiUrl}/TipoPrestamo`; // Ajusta tu endpoint

  constructor(private http: HttpClient) {}

  // Obtener todos los tipos de préstamo
  getTiposPrestamo(idSucursal: number | string): Observable<TipoPrestamo[]> {
    return this.http.get<TipoPrestamo[]>(`${this.apiUrl}/getTipoPrestamo/${idSucursal}`);
  }

  // Obtener un tipo de préstamo por ID
  getTipoPrestamoById(id: number): Observable<TipoPrestamo> {
    return this.http.get<TipoPrestamo>(`${this.apiUrl}/getTipoPrestamoById/${id}`);
  }

  // Crear un nuevo tipo de préstamo
  createTipoPrestamo(sucursalId: number,data: Partial<TipoPrestamo>): Observable<TipoPrestamo> {
    return this.http.post<TipoPrestamo>(`${this.apiUrl}/createTipoPrestamo`, data);
  }



  updateTipoPrestamo(id: number, tipoPrestamo: Partial<TipoPrestamo>): Observable<TipoPrestamo> {
  // Enviamos solo los datos a actualizar, el ID ya va en la URL
  return this.http.put<TipoPrestamo>(`${this.apiUrl}/updateTipoPrestamo/${id}`, tipoPrestamo);
}

  // Eliminar un tipo de préstamo
  deleteTipoPrestamo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteTipoPrestamo/${id}`);
  }
}