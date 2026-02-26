import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Prestamos {
  prestamo_id: number;
  cliente_id: number;         
  periodo_id: number;
  tipo_prestamo_id: number;    
  monto_prestamo: string | number; 
  saldo_pendiente: string | number;
  valor_intereses: string | number;
  valor_cuota: string | number; 
  fecha_desembolso: string | Date; 
  fecha_fin_prestamo: string | Date | null;
  created_at?: string;       
  estado_prestamo: string; 
  nombre_cliente?: string; 
  sucursal_id?: number;
  id_usuario_creacion: number;
}

export interface PrestamoCliente {
  prestamo_id: number;
  cliente: string;
  saldo_pendiente: string;
  valor_cuota: string;
  fecha_fin_prestamo: string | null;
}

export interface CobroDetalle {
  fecha_cobro: string;
  monto_cobrado: string;
  estado: string;
}

export interface PrestamoCobros {
  id_prestamo: number;
  nombre_cliente: string;
  saldo_pendiente: string;
  valor_cuota: string;
  fecha_fin_prestamo: string | null;
  data: CobroDetalle[];
  nombre_ruta?: string;
}


@Injectable({
  providedIn: 'root'
})
export class PrestamoService {
  private apiUrl = `${environment.apiUrl}/prestamo`;

  constructor(private http: HttpClient) {}

  getPrestamos(): Observable<Prestamos[]> {
    return this.http.get<Prestamos[]>(`${this.apiUrl}/getPrestamos`);
  }

  getPrestamosByCliente(cliente_id: number): Observable<PrestamoCliente[]> {
    return this.http.get<PrestamoCliente[]>(`${this.apiUrl}/getPrestamosByCliente/${cliente_id}`);
  }

  getPrestamoCobros(prestamo_id: number): Observable<PrestamoCobros> {
    return this.http.get<PrestamoCobros>(`${this.apiUrl}/prestamoCobros/${prestamo_id}`);
  }

  getPrestamoById (prestamo_id: number): Observable<Prestamos> {  
    return this.http.get<Prestamos>(`${this.apiUrl}/getPrestamoById/${prestamo_id}`);
  }

  updatePrestamo(id: number, prestamo: Partial<Prestamos>): Observable<Prestamos> {
    return this.http.put<Prestamos>(`${this.apiUrl}/updatePrestamo/${id}`, prestamo);
  }

  getPrestamoInfoById(prestamo_id: number): Observable<Prestamos> {
    return this.http.get<Prestamos>(`${this.apiUrl}/getPrestamoInfoById/${prestamo_id}`);
  }
 
  createPrestamo(prestamo: Partial<Prestamos>): Observable<Prestamos> {
    return this.http.post<Prestamos>(`${this.apiUrl}/createPrestamo`, prestamo);
  } 

  
}
