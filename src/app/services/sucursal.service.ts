import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


// Define una interfaz para tipar tus datos (opcional pero recomendado)
export interface Sucursal {
  sucursal_id: number;
  nombre: string;
  direccion: string;
  telefono: string | null;
  estado: string;
  fecha_creacion: string; // o Date, dependiendo de lo que devuelva la API
}

@Injectable({
  providedIn: 'root'
})
export class SucursalService {
  // URL base de tu API

  private apiUrl = `${environment.apiUrl}/sucursal`;

  constructor(private http: HttpClient) { }

  getSucursales(): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(`${this.apiUrl}/getsucursales`);
  }
  createSucursal(sucursal: Sucursal): Observable<Sucursal> {
    return this.http.post<Sucursal>(`${this.apiUrl}/createSucursal`, sucursal);
  }

  editSucursal(id: number, sucursal: Partial<Sucursal>): Observable<Sucursal> {
    return this.http.put<Sucursal>(`${this.apiUrl}/updateSucursal/${id}`, sucursal);
  }

  deleteSucursal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteSucursal/${id}`);
  }
  getSucursalById(id: number): Observable<Sucursal> {
    return this.http.get<Sucursal>(`${this.apiUrl}/getSucursalById/${id}`);
  } 
}
